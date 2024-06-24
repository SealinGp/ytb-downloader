FROM golang:1.22.0 AS builder

ENV GOPROXY=https://goproxy.cn,direct

WORKDIR /app

COPY go.mod go.sum ./

RUN go mod download

COPY . .

RUN go build -o ytb-downloader .

FROM debian:bullseye-slim
WORKDIR /app
COPY --from=builder /app/ytb-downloader .
EXPOSE 7777
CMD ["./ytb-downloader"]