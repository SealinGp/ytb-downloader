import { useEffect } from "react";
import {
  Code,
  Format,
  Info,
  OpenDownloadWindow,
  QueryKeyword,
  Response,
  Video,
} from "../api/api";
import Box from "@mui/material/Box";
import YouTubeIcon from "@mui/icons-material/YouTube";
import {
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  CardMedia,
  Chip,
  FormControl,
  Grid,
  IconButton,
  Input,
  InputLabel,
  Paper,
  Skeleton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  styled,
} from "@mui/material";
import { useImmer } from "use-immer";
import LoadingButton from "@mui/lab/LoadingButton";
import { Link, useSearchParams } from "react-router-dom";
import moment from "moment";
import DownloadIcon from "@mui/icons-material/Download";
import AudioFileIcon from "@mui/icons-material/AudioFile";
import VideoFileIcon from "@mui/icons-material/VideoFile";
import classNames from "classnames";
import { randomToN } from "../helper/helper";
import { encode, decode } from "rison";
import Err from "./components/Err";
import { BootstrapTooltip } from "./components/Tooltip";
import YouTube from "react-youtube";

interface QueryParams {
  kw: string;
  rd: number;
}

const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === "dark" ? "#1A2027" : "#fff",
  ...theme.typography.body2,
  padding: theme.spacing(1),
  textAlign: "center",
  color: theme.palette.text.secondary,
}));

function VideoDetail() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [keyword, setKeyword] = useImmer("");
  const [searching, setSearching] = useImmer(false);
  const [queryParams, updateQueryParams] = useImmer<QueryParams>({
    kw: "",
    rd: randomToN(100),
  });
  const [resp, setResp] = useImmer<Response<Video> | undefined>(undefined);

  useEffect(() => {
    if (queryParams.kw) {
      const query = encode(queryParams);
      setSearchParams((prev) => {
        prev.set(QueryKeyword, query);
        return prev;
      });
    }
  }, [queryParams]);

  useEffect(() => {
    const q = searchParams.get(QueryKeyword);
    if (q) {
      const queryParams: QueryParams = decode(q);
      if (queryParams.kw) {
        setKeyword(queryParams.kw);
        getVideoInfo(queryParams.kw);
      }
    }
  }, [searchParams]);

  const getVideoInfo = async (kw: string) => {
    setSearching(true);
    const resp = await Info(kw);
    setSearching(false);
    setResp(resp);
  };

  const onSearch = (e: KeyboardEvent) => {
    if (e.key == "Enter") {
      startSearch();
      return;
    }
  };

  const startSearch = () => {
    updateQueryParams((pre) => {
      pre.kw = keyword;
      pre.rd = randomToN(100);
    });
  };

  const subHeader = (video: Video) => {
    const dur = moment
      .duration(video.Duration / 1000 / 1000, "milliseconds")
      .humanize();
    return (
      <>
        <Typography variant="body2" color="text.secondary">
          by {video.Author}, {video.Views} views, {dur}
        </Typography>

        <Typography
          sx={{
            overflowWrap: "anywhere",
          }}
          variant="body2"
          color="text.secondary"
        >
          {video.Description}
        </Typography>
      </>
    );
  };

  const startDownload = async (i: number) => {
    if (!resp) {
      return;
    }

    OpenDownloadWindow({
      keyword: resp.data.ID,
      quality: resp.data.Formats[i].itag.toString(),
    });
  };

  const quality = (format: Format) => {
    return (
      <>
        {format.mimeType.includes("audio") && (
          <Box
            component="div"
            sx={{
              display: "flex",
              alignItems: "center",
            }}
          >
            <Typography>
              {format.audioQuality
                ? format.audioQuality.substring(
                  format.audioQuality.lastIndexOf("_") + 1,
                )
                : "-"}
            </Typography>
            <BootstrapTooltip title={format.mimeType}>
              <Chip
                sx={{ marginLeft: "5px" }}
                icon={<AudioFileIcon className="dark:text-red-200" />}
                label={"Audio"}
                variant="outlined"
              />
            </BootstrapTooltip>
          </Box>
        )}

        {!format.mimeType.includes("audio") && (
          <Box
            component="div"
            sx={{
              display: "flex",
              alignItems: "center",
            }}
          >
            <Typography>{format.qualityLabel}</Typography>
            <BootstrapTooltip title={format.mimeType}>
              <Chip
                sx={{ marginLeft: "5px" }}
                icon={<VideoFileIcon className="dark:text-red-200" />}
                label={"Video"}
                variant="outlined"
              />
            </BootstrapTooltip>
          </Box>
        )}
      </>
    );
  };

  const header = (video: Video) => {
    return (
      <CardHeader
        sx={{ width: "100%" }}
        title={video.Title}
        subheader={subHeader(video)}
        action={action(video)}
      />
    );
  };

  const content = (video: Video) => {
    const dur = moment
      .duration(video.Duration / 1000 / 1000, "milliseconds")
      .humanize();
    return (
      <>
        <CardContent >
          <Typography variant="h5" component="div">
            {video.Title}
          </Typography>

          <Typography className="dark:text-white" sx={{ fontSize: 14 }} color="text.secondary" gutterBottom>
            by {video.Author}, {video.Views} views, {dur}
          </Typography>

          <Typography className="dark:text-white" sx={{ mb: 1.5, overflowWrap: "anywhere", }} color="text.secondary">
            {video.Description}
          </Typography>
        </CardContent>
        <CardActions >
          <Link
            target="_blank"
            to={"https://www.youtube.com/watch?v=" + video.ID}
          >
            <Button size="small" className="dark:text-red-300">Learn More</Button>
          </Link>

        </CardActions>
      </>
    );
  };

  const action = (video: Video) => {
    return (
      <BootstrapTooltip title="open youtube link">
        <IconButton aria-label="settings">
          <Link
            target="_blank"
            to={"https://www.youtube.com/watch?v=" + video.ID}
          >
            <YouTubeIcon className={classNames("text-red-500")} />
          </Link>
        </IconButton>
      </BootstrapTooltip>
    );
  };

  const cardMedia = (video: Video) => {
    // const thumbnail = video.Thumbnails[video.Thumbnails.length - 1];
    const opts = {
      // height: thumbnail.Height,
      // width: thumbnail.Width,
      playerVars: {
        // https://developers.google.com/youtube/player_parameters
        autoplay: 0,
      },
    };

    return (
      <YouTube
        videoId={video.ID}
        id={video.ID}
        title={video.Title}
        opts={opts}
      />
    );
  };

  const CssTextField = styled(TextField)({
    '& label.Mui-focused': {
      color: '#A0AAB4',
    },
    '& .MuiInput-underline:after': {
      borderBottomColor: '#B2BAC2',
    },
    '& .MuiOutlinedInput-root': {
      '& fieldset': {
        borderColor: '#E0E3E7',
      },
      '&:hover fieldset': {
        borderColor: '#B2BAC2',
      },
      '&.Mui-focused fieldset': {
        borderColor: '#6F7E8C',
      },
    },
  });


  return (
    <div className="p-8 dark:bg-[#0E1214] dark:text-white"  >
      <Typography variant="h4" component="div" textAlign="center" >
        Youtube Video Downloader
      </Typography>

      <Stack spacing={2} sx={{ marginTop: "50px" }}>
        <Item sx={{ display: "flex", padding: "0" }} className="rounded-l p-2">
          {/* <CssTextField
            variant="standard"
            label="Input Youtube Url like 'https://www.youtube.com/watch?v=xxx' or just video id 'xxx'"
            className="w-full dark:bg-gray-500 rounded-l-lg"
            onKeyDown={(e) => onSearch(e)}
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
          /> */}
          <FormControl variant="standard" className="w-full dark:bg-gray-500 rounded-l-lg p-2" >
            <InputLabel className="p-2" htmlFor="kw">Input Youtube Url like 'https://www.youtube.com/watch?v=xxx' or just video id 'xxx'</InputLabel>
            <Input
              onKeyDown={(e) => onSearch(e)}
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)} id="kw" defaultValue="" />
          </FormControl>

          <LoadingButton
            className="dark:bg-gray-500 dark:text-red-200 rounded-none rounded-r-lg"
            onClick={(e) => startSearch()}
            loading={searching}
          >
            Search
          </LoadingButton>
        </Item>
        <Grid
          sx={{ width: "100%", margin: "0" }}
          container
          direction={"column"}
          justifyContent={"flex-start"}
          spacing={2}
        >
          {searching && (
            <>
              <Grid item xs={12} width={"100%"}>
                <Skeleton height={118} />
              </Grid>
              <Grid item xs={12} width={"100%"}>
                <Skeleton height={118} />
              </Grid>
              <Grid item xs={12} width={"100%"}>
                <Skeleton height={118} />
              </Grid>
              <Grid item xs={12} width={"100%"}>
                <Skeleton height={118} />
              </Grid>
            </>
          )}

          {!searching && resp && (
            <>
              {resp.code != Code.Ok && <Err {...resp} />}

              {resp.code == Code.Ok && resp.data && (
                <>
                  <Grid item xs={12} width={"100%"}>
                    <h3>Basic Info:</h3>
                  </Grid>

                  <Grid item xs={12} width={"100%"}>
                    <Card className={classNames("rounded-2.5xl dark:bg-gray-500 dark:text-white p-2")}>
                      {/* {header(resp.data)} */}
                      {cardMedia(resp.data)}
                      {content(resp.data)}
                    </Card>
                  </Grid>

                  <Grid item xs={12} width={"100%"}>
                    <h3>Video Formats:</h3>
                  </Grid>

                  <Grid item>
                    <TableContainer component={Paper} className="dark:bg-gray-500 rounded-2.5xl">
                      <Table sx={{ minWidth: 650 }}>
                        <TableHead>
                          <TableRow>
                            <TableCell>itag</TableCell>
                            <TableCell align="left">FPS</TableCell>
                            <TableCell align="left">quality</TableCell>
                            <TableCell align="left">size(MB)</TableCell>
                            <TableCell align="left">actions</TableCell>
                          </TableRow>
                        </TableHead>

                        <TableBody>
                          {resp.data.Formats.map((format, i) => (
                            <TableRow
                              key={format.itag}
                              sx={{
                                "&:last-child td, &:last-child th": {
                                  border: 0,
                                },
                              }}
                            >
                              <TableCell component="th" scope="row">
                                {format.itag}
                              </TableCell>
                              <TableCell align="left">
                                {format.fps ? format.fps : "-"}
                              </TableCell>
                              <TableCell align="left">
                                {quality(format)}
                              </TableCell>

                              <TableCell align="left">
                                {(format.contentLength / 1024 / 1024).toFixed(
                                  2,
                                )}
                              </TableCell>
                              <TableCell align="left">
                                <BootstrapTooltip title="download">
                                  <Button size="small" className="dark:text-red-300">
                                    <DownloadIcon onClick={(e) => startDownload(i)} />
                                  </Button>
                                </BootstrapTooltip>
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
    </div>
  );
}

export default VideoDetail;
