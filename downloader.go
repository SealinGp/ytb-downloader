package main

import (
	"crypto/tls"
	"net/http"
	"net/url"
	"os"

	"github.com/kkdai/youtube/v2"
	ytdl "github.com/kkdai/youtube/v2/downloader"
)

func initDownloader() {
	httpCli := &http.Client{
		Transport: &http.Transport{
			TLSClientConfig: &tls.Config{
				InsecureSkipVerify: true,
			},
		},
	}

	proxyAddr, err := url.Parse(os.Getenv("HTTPS_PROXY"))
	if err == nil && proxyAddr != nil && proxyAddr.Host != "" {
		httpCli = &http.Client{
			Transport: &http.Transport{
				Proxy: http.ProxyURL(proxyAddr),
				TLSClientConfig: &tls.Config{
					InsecureSkipVerify: true,
				},
			},
		}
	}

	ytbDownloader = &ytdl.Downloader{
		Client: youtube.Client{
			HTTPClient: httpCli,
		},
	}
}
