import { useEffect } from 'react'
import './App.css'
import { Code, Info, OpenDownloadWindow, QueryKeyword, Response, Video } from './api/api'
import Box from '@mui/material/Box';
import { Alert, AlertTitle, Card, CardHeader, CardMedia, Chip, Grid, IconButton, Paper, Skeleton, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography, styled } from '@mui/material'
import { useImmer } from 'use-immer'
import LoadingButton from '@mui/lab/LoadingButton';
import rison from 'rison-node'
import { Link, useSearchParams } from 'react-router-dom'
import moment from 'moment';
import LinkIcon from '@mui/icons-material/Link';
import DownloadIcon from '@mui/icons-material/Download';
import AudioFileIcon from '@mui/icons-material/AudioFile';
import VideoFileIcon from '@mui/icons-material/VideoFile';

interface QueryParams {
  kw: string
}

const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
  ...theme.typography.body2,
  padding: theme.spacing(1),
  textAlign: 'center',
  color: theme.palette.text.secondary,
}));


function App() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [keyword, setKeyword] = useImmer('')
  const [searching, setSearching] = useImmer(false)
  const [queryParams, updateQueryParams] = useImmer<QueryParams>({ kw: '' })
  const [resp, setResp] = useImmer<Response<Video> | undefined>(undefined)

  useEffect(() => {
    if (queryParams.kw) {
      const query = rison.encode(queryParams)
      setSearchParams((prev) => {
        prev.set(QueryKeyword, query)
        return prev
      })
    }
  }, [queryParams])

  useEffect(() => {
    const q = searchParams.get(QueryKeyword)
    if (q) {
      const queryParams: QueryParams = rison.decode(q)
      if (queryParams.kw) {
        setKeyword(queryParams.kw)
        getVideoInfo(queryParams.kw)
      }
    }

  }, [searchParams])

  const getVideoInfo = async (kw: string) => {
    setSearching(true)
    const resp = await Info(kw)
    setSearching(false)
    setResp(resp)
  }

  const onSearch = (e: KeyboardEvent) => {
    if (e.key == 'Enter') {
      startSearch()
      return
    }
  }

  const startSearch = () => {
    updateQueryParams((pre) => {
      pre.kw = keyword
    })
  }

  const subHeader = (video: Video) => {
    return <Typography variant='body2' color="text.secondary">
      by {video.Author}, {video.Views} views, {moment.duration(video.Duration / 1000 / 1000, 'milliseconds').humanize()}
    </Typography>
  }


  const startDownload = async (i: number) => {
    if (!resp) {
      return
    }

    OpenDownloadWindow({
      keyword: resp.data.ID,
      quality: resp.data.Formats[i].itag.toString()
    })
  }

  return (
    <Box sx={{ height: '100%', padding: '2rem' }}>
      <Typography variant="h4" component="div" textAlign='center' >
        Youtube Video Downloader
      </Typography>
      <Stack spacing={2} sx={{ marginTop: '50px' }}>
        <Item sx={{ display: 'flex', padding: '0' }}>
          <TextField onKeyDown={(e) => onSearch(e)} fullWidth value={keyword} onChange={(e) => setKeyword(e.target.value)} label="Input Youtube Url like 'https://www.youtube.com/watch?v=xxx' or just video id 'xxx'" variant="outlined" />
          <LoadingButton onClick={(e) => startSearch()} loading={searching} sx={{ marginLeft: '5px' }}>Search</LoadingButton>
        </Item>
        <Grid
          sx={{ width: '100%', margin: '0' }}
          container
          direction={'column'}
          justifyContent={'flex-start'}
          spacing={2}>

          {searching && (
            <>
              <Grid item xs={12} width={'100%'}>
                <Skeleton height={118} />
              </Grid>
              <Grid item xs={12} width={'100%'} >
                <Skeleton height={118} />
              </Grid>
              <Grid item xs={12} width={'100%'}>
                <Skeleton height={118} />
              </Grid>
              <Grid item xs={12} width={'100%'}>
                <Skeleton height={118} />
              </Grid>
            </>
          )}

          {!searching && resp && (
            <>
              {resp.code != Code.Ok && (
                <Alert severity="error">
                  <AlertTitle>Search Video Failed</AlertTitle>
                  <p>{resp.msg}</p>
                  <p>{resp.request_id}</p>
                </Alert>
              )}

              {resp.code == Code.Ok && resp.data && (
                <>
                  <Grid item xs={12} width={'100%'}>
                    <h3>Basic Info:</h3>
                  </Grid>

                  <Grid item xs={12} width={'100%'}>
                    <Card sx={{ display: 'flex' }}>
                      {resp.data.Thumbnails.length > 0 && (
                        <CardMedia
                          sx={{ maxWidth: 151 }}
                          component="img"
                          image={resp.data.Thumbnails[resp.data.Thumbnails.length - 1].URL}
                        />
                      )}

                      <CardHeader
                        sx={{ width: '100%' }}
                        title={resp.data.Title}
                        subheader={subHeader(resp.data)}
                        action={
                          <IconButton aria-label="settings">
                            <Link target="_blank" to={'https://www.youtube.com/watch?v=' + resp.data.ID}>
                              <LinkIcon />
                            </Link>
                          </IconButton>
                        }
                      />


                      {/* <CardContent>
                      <Typography variant="body2" color="text.secondary">
                        {resp.data.Description}
                      </Typography>

                      <Typography variant="body2" color="text.secondary">
                        duration: {resp.data.Duration}
                      </Typography>
                    </CardContent> */}
                    </Card>
                  </Grid>

                  <Grid item xs={12} width={'100%'}>
                    <h3>Video Formats:</h3>
                  </Grid>

                  <Grid item>
                    <TableContainer component={Paper}>
                      <Table sx={{ minWidth: 650 }}>
                        <TableHead>
                          <TableRow>
                            <TableCell>itag</TableCell>
                            <TableCell align="left">FPS</TableCell>
                            <TableCell align="left">quality</TableCell>
                            <TableCell align="left">size(MB)</TableCell>
                            <TableCell align="left">mime type</TableCell>
                            <TableCell align="left">actions</TableCell>
                          </TableRow>
                        </TableHead>



                        <TableBody>
                          {resp.data.Formats.map((format, i) => (
                            <TableRow
                              key={format.itag}
                              sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                            >
                              <TableCell component="th" scope="row">
                                {format.itag}
                              </TableCell>
                              <TableCell align="left">{format.fps ? format.fps : '-'}</TableCell>
                              <TableCell align="left">
                                {format.mimeType.includes('audio') && (
                                  <Box component='div' sx={{ display: 'flex', alignItems: 'center' }}>
                                    <Typography >
                                      {format.audioQuality ? format.audioQuality.substring(format.audioQuality.lastIndexOf('_') + 1) : '-'}
                                    </Typography>
                                    <Chip sx={{ marginLeft: '5px' }} icon={<AudioFileIcon />} label={"Audio"} variant="outlined" />
                                  </Box>
                                )}

                                {!format.mimeType.includes('audio') && (
                                  <Box component='div' sx={{ display: 'flex', alignItems: 'center' }}>
                                    <Typography >{format.qualityLabel}</Typography>
                                    <Chip sx={{ marginLeft: '5px' }} icon={<VideoFileIcon />} label={"Video"} variant="outlined" />
                                  </Box>
                                )}
                              </TableCell>


                              <TableCell align="left">{(format.contentLength / 1024 / 1024).toFixed(2)}</TableCell>
                              <TableCell align="left">{format.mimeType}</TableCell>
                              <TableCell align="left">
                                <LoadingButton size="large" loading={format.loading ? format.loading : false} onClick={(e) => startDownload(i)}>
                                  <DownloadIcon />
                                </LoadingButton>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Grid>
                </>

              )}
            </>
          )}
        </Grid>
      </Stack>

    </Box >
  )
}

export default App
