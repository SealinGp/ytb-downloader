package main

import (
	"context"
	"flag"
	"fmt"

	"github.com/cloudwego/hertz/pkg/app"
	"github.com/cloudwego/hertz/pkg/app/server"
	"github.com/hertz-contrib/requestid"
	ytdl "github.com/kkdai/youtube/v2/downloader"
)

var (
	ytbDownloader *ytdl.Downloader
	httpAddr      string
)

func main() {
	flag.StringVar(&httpAddr, "http-addr", ":7777", "listen http addr 127.0.0.1:7777")
	flag.Parse()

	fmt.Printf("httpAddr:%v\n", httpAddr)

	initDownloader()
	hertzSvr := server.Default(
		server.WithHostPorts(httpAddr),
	)

	api := hertzSvr.Group("/api")
	{
		api.Use(requestid.New())
		api.GET("/v1/info", Info)
		api.GET("/v1/download", Download)
	}

	hertzSvr.GET("/", func(c context.Context, ctx *app.RequestContext) {
		ctx.File("web/dist/index.html")
	})
	hertzSvr.Static("/", "./web/dist")
	hertzSvr.Spin()
}
