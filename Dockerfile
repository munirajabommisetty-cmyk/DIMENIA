# ==============================================================================
# STAGE 1: Build pinned whisper.cpp v1.5.4 native Linux static binary
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

# Gather compiled static executable into dist-bin
RUN mkdir -p /whisper-src/dist-bin && \
    (cp -f /whisper-src/build-static/bin/whisper-cli /whisper-src/dist-bin/whisper-cli 2>/dev/null || \
     cp -f /whisper-src/build-static/bin/main /whisper-src/dist-bin/whisper-cli 2>/dev/null || \
     find /whisper-src/build-static -name "whisper-cli" -type f -exec cp -f {} /whisper-src/dist-bin/whisper-cli \; 2>/dev/null || \
     find /whisper-src/build-static -name "main" -type f -exec cp -f {} /whisper-src/dist-bin/whisper-cli \; 2>/dev/null)

# Verify static Linux executable inside builder
RUN chmod +x /whisper-src/dist-bin/whisper-cli && \
    /whisper-src/dist-bin/whisper-cli --help > /dev/null && \
    echo "[Docker Stage 1] Static whisper-cli binary compiled and verified successfully!"

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

# Copy compiled Linux static whisper binary from STAGE 1
COPY --from=whisper-builder /whisper-src/dist-bin/whisper-cli /app/backend/models/whisper/whisper-cli
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

# Build React frontend & Express backend (tsc and vite are available!)
RUN npm run build

# ==============================================================================
# STAGE 3: Minimal production runner
# ==============================================================================
FROM node:20-slim AS runner

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=5000

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

# Ensure Linux whisper executable is executable
RUN chmod +x /app/backend/models/whisper/whisper-cli

# MANDATORY: Verify whisper-cli execution in STAGE 3 runner
RUN /app/backend/models/whisper/whisper-cli --help > /dev/null && \
    echo "[Docker Stage 3 Runner] Static whisper-cli verified and executed successfully!"

EXPOSE 5000

CMD ["npm", "run", "start"]
