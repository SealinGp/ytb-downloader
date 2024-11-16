FROM golang:1.22.0 AS builder
WORKDIR /app
ENV GOPROXY=https://goproxy.cn,direct
COPY go.mod go.sum ./
COPY . .
RUN go mod download && GOOS=linux GOARCH=amd64 go build -o ytb-downloader .

FROM debian:stable-slim
WORKDIR /app
COPY --from=builder /app/ytb-downloader .
COPY --from=builder /app/web/dist ./web/dist

# 使用 ARG 定义一个默认值，可以在构建时通过 --build-arg 覆盖
ARG HOST=0.0.0.0
ARG PORT=7777

# 使用 ENV 设置环境变量，这样 CMD 中就可以引用了
ENV HOST=${HOST}
ENV PORT=${PORT}

# 暴露端口，使用静态值或者环境变量
EXPOSE 7777

# 运行应用，显式使用 Shell 解析环境变量
CMD ["/bin/sh", "-c", "./ytb-downloader -http-addr $HOST:$PORT"]
