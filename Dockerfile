FROM golang:1.22.0 AS builder

ENV GOPROXY=https://goproxy.cn,direct

WORKDIR /app

COPY go.mod go.sum ./

RUN go mod download

COPY . .

RUN go build -o ytb-downloader .

EXPOSE 7777

# 设置容器启动时运行的命令
ENTRYPOINT ["./ytb-downloader"] 