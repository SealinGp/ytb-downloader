package main

import (
	"context"
	"errors"
	"fmt"
	"strconv"

	"github.com/cloudwego/hertz/pkg/app"
	"github.com/kkdai/youtube/v2"
	"github.com/kkdai/youtube/v2/downloader"
)

func Info(c context.Context, ctx *app.RequestContext) {
	ytbUrl := ctx.Param("youtube_url")
	if ytbUrl == "" {
		RespFail[*youtube.Video](ctx, RespWithMsg[*youtube.Video]("param youtube_url required"))
		return
	}

	video, err := ytbDownloader.GetVideoContext(c, ytbUrl)
	if err != nil {
		RespFail[*youtube.Video](ctx, RespWithMsg[*youtube.Video](err.Error()))
		return
	}

	RespOk(ctx, RespWithData(video))
}

type MimeType uint8

func (mt MimeType) String() string {
	switch mt {
	case MP4:
		return "mp4"
	case WEBM:
		return "webm"
	case AV01:
		return "av01"
	case AVC1:
		return "avc1"
	default:
		return "none"
	}
}

const (
	NONE MimeType = iota
	MP4
	WEBM
	AV01
	AVC1
)

type DownloadRequest struct {
	Keyword  string   `json:"keyword,omitempty"` //video url or id
	Language string   `json:"language,omitempty"`
	MimeType MimeType `json:"mime_type,omitempty"`
	Quality  string   `json:"quality,omitempty"` //itag number or quality string
}

func Download(c context.Context, ctx *app.RequestContext) {
	req := &DownloadRequest{}
	if err := ctx.BindJSON(req); err != nil {
		RespFail[*youtube.Video](ctx, RespWithMsg[*youtube.Video](err.Error()))
		return
	}

	video, err := ytbDownloader.GetVideoContext(c, req.Keyword)
	if err != nil {
		RespFail[*youtube.Video](ctx, RespWithMsg[*youtube.Video](err.Error()))
		return
	}

	format, err := getFormat(req, video)
	if err != nil {
		RespFail[*youtube.Video](ctx, RespWithMsg[*youtube.Video](err.Error()))
		return
	}

	filename := getFileName(video, format)
	stream, size, err := ytbDownloader.GetStreamContext(c, video, format)
	if err != nil {
		RespFail[*youtube.Video](ctx, RespWithMsg[*youtube.Video](err.Error()))
		return
	}

	ctx.Header("Content-Type", "application/octet-stream")
	ctx.Header("content-disposition", fmt.Sprintf("attachment; filename=\"%s\"", filename))
	ctx.Header("Content-Transfer-Encoding", "binary")
	ctx.SetBodyStream(stream, int(size))
}

func getFileName(video *youtube.Video, format *youtube.Format) string {
	filename := downloader.SanitizeFilename(video.Title)
	filename += pickIdealFileExtension(format.MimeType)
	return filename
}

func getFormat(req *DownloadRequest, video *youtube.Video) (*youtube.Format, error) {
	formats := video.Formats

	if req.Language != "" {
		formats = formats.Language(req.Language)
	}
	if req.MimeType != NONE {
		formats = formats.Type(req.MimeType.String())
	}
	if req.Quality != "" {
		formats = formats.Quality(req.Quality)
	}

	itag, _ := strconv.Atoi(req.Quality)
	if itag > 0 {
		formats = formats.Itag(itag)
	}

	if formats == nil {
		return nil, errors.New("unable to find the specified format")
	}

	formats.Sort()
	return &formats[0], nil
}
