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
ENV HTTP_ADDR=":7777"

EXPOSE 7777
CMD ["./ytb-downloader","-http-addr=${HTTP_ADDR}"]