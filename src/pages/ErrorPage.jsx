import { useRouteError } from "react-router-dom";
import { Typography } from "@mui/material";

export default function ErrorPage() {
  const error = useRouteError();
  console.error(error);

  return (
    <div className="w-screen h-screen flex flex-col justify-center items-center text-white">
      <Typography variant="h2" gutterBottom>
        Oops!
      </Typography>
      <Typography variant="div" fontSize="large" gutterBottom>
        Sorry, an unexpected error has occurred.
      </Typography>
      <Typography variant="overline" fontSize="large" gutterBottom>
        {error.statusText || error.message}
      </Typography>
    </div>
  );
}
