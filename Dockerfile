# ==============================================================================
# STAGE 1: Build pinned whisper.cpp v1.5.4 native Linux binary with $ORIGIN RPATH
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

# Build whisper-cli and libwhisper.so with $ORIGIN RPATH and WHISPER_OPENMP=OFF
RUN cmake -B build \
    -DBUILD_SHARED_LIBS=ON \
    -DWHISPER_BUILD_EXAMPLES=ON \
    -DWHISPER_OPENMP=OFF \
    -DCMAKE_INSTALL_RPATH='$ORIGIN' \
    -DCMAKE_BUILD_WITH_INSTALL_RPATH=ON \
    -DCMAKE_EXE_LINKER_FLAGS="-Wl,-rpath,'\$$ORIGIN'" && \
    cmake --build build --config Release

# Gather compiled binary and shared libraries into dist-bin
RUN mkdir -p /whisper-src/dist-bin && \
    (cp -f /whisper-src/build/bin/whisper-cli /whisper-src/dist-bin/whisper-cli 2>/dev/null || \
     cp -f /whisper-src/build/bin/main /whisper-src/dist-bin/whisper-cli 2>/dev/null || \
     find /whisper-src/build -name "whisper-cli" -type f -exec cp -f {} /whisper-src/dist-bin/whisper-cli \; 2>/dev/null || \
     find /whisper-src/build -name "main" -type f -exec cp -f {} /whisper-src/dist-bin/whisper-cli \; 2>/dev/null) && \
    find /whisper-src/build -name "*.so*" -exec cp -L {} /whisper-src/dist-bin/ \; 2>/dev/null || true

# Ensure libwhisper.so, libwhisper.so.1, libwhisper.so.1.5.4 copies all exist in dist-bin
RUN cd /whisper-src/dist-bin && \
    for f in *.so*; do \
        if [ -f "$f" ]; then \
            cp -f "$f" libwhisper.so 2>/dev/null || true; \
            cp -f "$f" libwhisper.so.1 2>/dev/null || true; \
            cp -f "$f" libwhisper.so.1.5.4 2>/dev/null || true; \
            break; \
        fi; \
    done

# Verify compiled Linux binary inside builder
RUN chmod +x /whisper-src/dist-bin/whisper-cli && \
    cd /whisper-src/dist-bin && \
    ./whisper-cli --help > /dev/null && \
    echo "[Docker Stage 1] whisper-cli with \$ORIGIN RPATH verified successfully!"

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
COPY --from=whisper-builder /whisper-src/dist-bin/ /app/backend/models/whisper/
RUN chmod +x /app/backend/models/whisper/whisper-cli

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

# Build React frontend & Express backend
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
    mkdir -p /usr/local/lib /usr/lib && \
    cp -L /app/backend/models/whisper/*.so* /usr/local/lib/ 2>/dev/null || true && \
    cp -L /app/backend/models/whisper/*.so* /usr/lib/ 2>/dev/null || true && \
    (ldconfig 2>/dev/null || true)

# MANDATORY: Verify whisper-cli execution in STAGE 3 runner
RUN cd /app/backend/models/whisper && \
    ./whisper-cli --help > /dev/null && \
    echo "[Docker Stage 3 Runner] whisper-cli with \$ORIGIN RPATH verified and executed successfully!"

EXPOSE 5000

CMD ["npm", "run", "start"]
