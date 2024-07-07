import { Close, ContentCopy, LibraryAddCheck } from "@mui/icons-material";
import {
  Alert,
  AlertTitle,
  Chip,
  Fade,
  IconButton,
  Snackbar,
  Stack,
  Typography,
} from "@mui/material";
import { ReactNode, useEffect } from "react";
import { useImmer } from "use-immer";
import { BasicResponse, Code } from "../../api/api";
import classNames from "classnames";
import { CopyToClipboard } from "react-copy-to-clipboard";

export default function Err(props: BasicResponse) {
  const { code, msg, request_id } = props;
  const [open, updateOpen] = useImmer(false);
  const [copied, updateCopied] = useImmer(false);

  useEffect(() => {
    if (code != Code.Ok) {
      updateOpen(true);
    }
  }, [request_id, code]);

  const handleClose = () => {
    updateOpen(false);
  };

  const handleCopy = () => {
    updateCopied(true);
    setTimeout(() => {
      updateCopied(false);
    }, 2000);
  };

  const errAction = (): ReactNode => {
    return (
      <IconButton
        size="small"
        aria-label="close"
        color="default"
        onClick={handleClose}
      >
        <Close fontSize="small" />
      </IconButton>
    );
  };

  const errMsg = () => {
    return (
      <Stack spacing={2} className={classNames("max-w-screen-sm")}>
        <Alert severity="error">
          <AlertTitle>
            <Typography variant="body1">code:{code}</Typography>
          </AlertTitle>
          <Typography fontSize={14} variant="body1">
            {msg}
          </Typography>
          <p>
            <Chip
              label={
                <Typography fontSize={14} variant={"body1"}>
                  request id:
                  {request_id}
                  <CopyToClipboard
                    text={request_id}
                    onCopy={() => handleCopy()}
                  >
                    <IconButton
                      size="small"
                      aria-label="copy"
                      disabled={copied}
                    >
                      {!copied && <ContentCopy />}
                      {copied && <LibraryAddCheck />}
                    </IconButton>
                  </CopyToClipboard>
                </Typography>
              }
            />
          </p>
        </Alert>
      </Stack>
    );
  };

  return (
    <Snackbar
      ContentProps={{ sx: { backgroundColor: "#FDEDED" } }}
      anchorOrigin={{ vertical: "top", horizontal: "right" }}
      open={open}
      message={errMsg()}
      action={errAction()}
      TransitionComponent={Fade}
    />
  );
}
