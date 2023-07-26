import axios from "axios";

/*
예시 : 
useGetApi("challenges");
const headers = {
  ACCESS : "eyJ0eXBlIjoiand0IiwiYWxnIjoiSFMyNTYifQ.eyJzd"
}
useGetApi("challenges", headers);
*/

// const BACKEND_URL = "http://test-api.schooloud.cloud/api/v1/";

const BACKEND_URL = "https://a2d2-115-114-17-62.ngrok-free.app/inference";

export async function useGetApi(headers, params) {
  const response = await axios.get(BACKEND_URL, {
    headers: headers,
    params: params,
    withCredentials: true,
  });

  return response;
}

export async function usePostApi(requestBody, headers, params) {
  const response = await axios.post(BACKEND_URL, requestBody, {
    headers: headers,
    params: params,
    withCredentials: true,
  });
  return response;
}
