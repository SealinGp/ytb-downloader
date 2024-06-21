package main

import (
	"flag"

	"github.com/cloudwego/hertz/pkg/app/server"
	ytdl "github.com/kkdai/youtube/v2/downloader"
)

var (
	ytbDownloader *ytdl.Downloader
	httpAddr      string
)

func main() {
	flag.StringVar(&httpAddr, "http-addr", "127.0.0.1:7777", "listen http addr 127.0.0.1:7777")
	flag.Parse()

	initDownloader()
	hertzSvr := server.Default(
		server.WithHostPorts(httpAddr),
	)

	api := hertzSvr.Group("/api")
	{
		api.GET("/v1/info/:youtube_url", Info)
		api.POST("/v1/download", Download)
	}

	//TODO: web
	hertzSvr.Spin()
}
