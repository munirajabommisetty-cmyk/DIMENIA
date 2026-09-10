# ==============================================================================
# STAGE 1: Build pinned whisper.cpp v1.5.4 native Linux binary & shared library
# ==============================================================================
FROM node:20-slim AS whisper-builder

ENV DEBIAN_FRONTEND=noninteractive
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    cmake \
    git \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Clone pinned whisper.cpp release v1.5.4
WORKDIR /whisper-src
RUN git clone -b v1.5.4 --single-branch https://github.com/ggerganov/whisper.cpp.git .

# Build static whisper-cli (linking libwhisper statically so binary is self-contained)
RUN cmake -B build-static -DBUILD_SHARED_LIBS=OFF -DWHISPER_BUILD_EXAMPLES=ON && \
    cmake --build build-static --config Release

# Build shared libwhisper.so
RUN cmake -B build-shared -DBUILD_SHARED_LIBS=ON -DCMAKE_INSTALL_RPATH='$ORIGIN' -DCMAKE_BUILD_WITH_INSTALL_RPATH=ON && \
    cmake --build build-shared --config Release

# Gather compiled binaries and shared libraries into dist-bin using dereferencing cp -L
RUN mkdir -p /whisper-src/dist-bin && \
    (cp -f /whisper-src/build-static/bin/whisper-cli /whisper-src/dist-bin/ 2>/dev/null || \
     cp -f /whisper-src/build-static/bin/main /whisper-src/dist-bin/whisper-cli 2>/dev/null || \
     find /whisper-src/build-static -name "main" -exec cp -f {} /whisper-src/dist-bin/whisper-cli \; 2>/dev/null || \
     find /whisper-src/build-static -name "whisper-cli" -exec cp -f {} /whisper-src/dist-bin/whisper-cli \; 2>/dev/null || true) && \
    find /whisper-src/build-shared -name "*.so*" -exec cp -L {} /whisper-src/dist-bin/ \; 2>/dev/null || true

# Ensure all shared library symlinks/copies (libwhisper.so, libwhisper.so.1, libwhisper.so.1.5.4) exist
RUN cd /whisper-src/dist-bin && \
    for f in *.so*; do \
        if [ -f "$f" ]; then \
            cp -f "$f" libwhisper.so 2>/dev/null || true; \
            cp -f "$f" libwhisper.so.1 2>/dev/null || true; \
            cp -f "$f" libwhisper.so.1.5.4 2>/dev/null || true; \
            break; \
        fi; \
    done

# Verify compiled Linux executable inside whisper-builder
RUN if [ -f "/whisper-src/dist-bin/whisper-cli" ]; then \
        LD_LIBRARY_PATH="/whisper-src/dist-bin:$LD_LIBRARY_PATH" /whisper-src/dist-bin/whisper-cli --help > /dev/null; \
    elif [ -f "/whisper-src/dist-bin/main" ]; then \
        LD_LIBRARY_PATH="/whisper-src/dist-bin:$LD_LIBRARY_PATH" /whisper-src/dist-bin/main --help > /dev/null; \
    else \
        echo "Error: Neither whisper-cli nor main executable found after build"; exit 1; \
    fi

# ==============================================================================
# STAGE 2: Node.js application builder (installs devDependencies for compilation)
# ==============================================================================
FROM node:20-slim AS app-builder

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Copy package files for both root and backend
COPY package*.json ./
COPY backend/package*.json ./backend/

# Install ALL dependencies (including devDependencies like typescript & vite)
RUN npm ci && npm ci --prefix backend

# Copy full application source
COPY . .

# Copy compiled Linux whisper binary and shared libraries from STAGE 1
COPY --from=whisper-builder /whisper-src/dist-bin/ /app/whisper-bin/
RUN mkdir -p /app/backend/models/whisper && \
    if [ -f "/app/whisper-bin/whisper-cli" ]; then \
        cp -L /app/whisper-bin/whisper-cli /app/backend/models/whisper/whisper-cli; \
    elif [ -f "/app/whisper-bin/main" ]; then \
        cp -L /app/whisper-bin/main /app/backend/models/whisper/whisper-cli; \
    fi && \
    cp -L /app/whisper-bin/* /app/backend/models/whisper/ 2>/dev/null || true && \
    chmod +x /app/backend/models/whisper/whisper-cli && \
    rm -rf /app/whisper-bin

# Verify Git LFS ggml-tiny.bin model size inside builder
RUN MODEL_PATH="/app/backend/models/whisper/ggml-tiny.bin" && \
    if [ -f "$MODEL_PATH" ]; then \
        FILE_SIZE=$(wc -c < "$MODEL_PATH"); \
        echo "[Docker Build] ggml-tiny.bin size: ${FILE_SIZE} bytes"; \
        if [ "$FILE_SIZE" -lt 1000000 ]; then \
            echo "[Docker Build] LFS pointer detected (${FILE_SIZE} bytes). Fetching full ggml-tiny.bin model..."; \
            curl -L -o "$MODEL_PATH" "https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-tiny.bin"; \
        fi \
    else \
        echo "[Docker Build] Downloading ggml-tiny.bin model..."; \
        mkdir -p /app/backend/models/whisper && \
        curl -L -o "$MODEL_PATH" "https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-tiny.bin"; \
    fi

# Build React frontend & Express backend (tsc and vite are available!)
RUN npm run build

# ==============================================================================
# STAGE 3: Minimal production runner
# ==============================================================================
FROM node:20-slim AS runner

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=5000
ENV LD_LIBRARY_PATH="/app/backend/models/whisper:/usr/local/lib:/usr/lib:${LD_LIBRARY_PATH}"

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY backend/package*.json ./backend/

# Install production dependencies only
RUN npm ci --omit=dev && npm ci --prefix backend --omit=dev

# Copy compiled build artifacts from STAGE 2
COPY --from=app-builder /app/dist ./dist
COPY --from=app-builder /app/backend/dist ./backend/dist
COPY --from=app-builder /app/backend/models ./backend/models

# Ensure Linux whisper executable is executable, copy shared libraries to system folders, register with ldconfig
RUN chmod +x /app/backend/models/whisper/whisper-cli && \
    mkdir -p /usr/local/lib /usr/lib /etc/ld.so.conf.d && \
    cp -L /app/backend/models/whisper/*.so* /usr/local/lib/ 2>/dev/null || true && \
    cp -L /app/backend/models/whisper/*.so* /usr/lib/ 2>/dev/null || true && \
    cd /app/backend/models/whisper && \
    (for f in *.so*; do \
        if [ -f "$f" ]; then \
            cp -f "$f" libwhisper.so 2>/dev/null || true; \
            cp -f "$f" libwhisper.so.1 2>/dev/null || true; \
            cp -f "$f" /usr/local/lib/libwhisper.so 2>/dev/null || true; \
            cp -f "$f" /usr/local/lib/libwhisper.so.1 2>/dev/null || true; \
            cp -f "$f" /usr/lib/libwhisper.so 2>/dev/null || true; \
            cp -f "$f" /usr/lib/libwhisper.so.1 2>/dev/null || true; \
            break; \
        fi; \
    done) && \
    echo "/app/backend/models/whisper" > /etc/ld.so.conf.d/whisper.conf && \
    (ldconfig 2>/dev/null || true)

# MANDATORY: Verify dynamic library linking and whisper-cli execution in STAGE 3 runner
RUN /app/backend/models/whisper/whisper-cli --help > /dev/null && \
    echo "[Docker Stage 3 Runner] whisper-cli verified and dynamic libraries loaded successfully!"

EXPOSE 5000

CMD ["npm", "run", "start"]





