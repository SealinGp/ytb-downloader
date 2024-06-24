import axios from "axios";
import base64 from 'base-64'
// import { FsaNodeFs } from 'memfs/lib/fsa-to-node';
// import { IFileSystemDirectoryHandle } from "memfs/lib/fsa/types";
// import { getFilenameFromHeader } from "../helper/helper";
// import { BinaryWriter } from "stream-binary";



export const QueryKeyword = 'q';

export enum Code {
    Ok = 1,
    Fail = 2
}


export interface Response<T> extends RequestID {
    code: Code;
    msg: string;
    data: T;
}


export enum MimeType {
    NONE = 0,
    MP4 = 1,
    WEBM = 2,
    AV01 = 3,
    AVC1 = 4
}

export interface RequestID {
    request_id: string;
}

export interface Video extends RequestID {
    ID: string;
    Title: string;
    Description: string;
    Author: string;
    ChannelID: string;
    ChannelHandle: string;
    Views: number;
    Duration: number;
    PublishDate: string;
    Formats: Format[];
    Thumbnails: Thumbnail[];
}

export interface Thumbnail {
    URL: string;
    Width: number;
    Height: number;
}

export interface Format {
    itag: number;
    fps: number;
    url: string;
    mimeType: string;
    quality: string;
    signatureCipher: string;
    bitrate: number;
    itagfps: number;
    width: number;
    height: number;
    lastModified: string;
    contentLength: number;
    qualityLabel: string;
    projectionType: string;
    averageBitrate: number;
    audioQuality: string;
    approxDurationMs: string;
    audioSampleRate: string;
    audioChannels: number;
}


export const RequestIDKey = 'x-request-id'




export function WithReqID(resp: any) {
    let reqId = ''
    if (resp && resp.headers) {
        reqId = resp.headers[RequestIDKey]
    }
    resp.data.request_id = reqId
    return resp.data
}

export function Info(idOrUrl: string): Promise<Response<Video>> {
    return axios.get<Response<Video>>(`/api/v1/info`, {
        params: {
            ytb_kw: base64.encode(idOrUrl)
        }
    }).then(resp => WithReqID(resp))
}

export interface DownloadRequest {
    keyword: string;
    language?: string;
    mime_type?: MimeType;
    quality?: string;
}




export function OpenDownloadWindow(req: DownloadRequest) {
    const url = axios.getUri({
        url: '/api/v1/download',
        method: 'get',
        params: req,
    })
    const a = document.createElement('a')
    a.href = url
    a.target = '_blank'
    a.click()
}

// export async function Download(req: DownloadRequest) {
//     return axios.get(`/api/v1/download`, {
//         params: req,
//         responseType: 'stream',
//         onDownloadProgress: function (e: AxiosProgressEvent) {
//             console.log('onDownload event:', e)
//         }
//     }).then(resp => {
//         const fileSizeBytes = Number(resp.headers['content-length'])
//         const filename = getFilenameFromHeader(resp.headers)
//         console.log(`file:${filename} size:${(fileSizeBytes / 1024 / 1024).toFixed(2)}MB`)


//         const blob = new Blob([resp.data]);

//         const url = URL.createObjectURL(blob)
//         const a = document.createElement('a')

//         a.href = url
//         a.download = filename
//         a.click()
//         return
//     })
// }