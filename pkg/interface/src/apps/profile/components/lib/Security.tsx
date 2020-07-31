import React from "react";
import { Box, Button } from "@tlon/indigo-react";

import GlobalApi from "../../../../api/global";

interface SecuritySettingsProps {
  api: GlobalApi;
}

export default function SecuritySettings({ api }: SecuritySettingsProps) {
  return (
    <>
      <Box color="black" fontSize={1} mt={7} mb={2} fontWeight={900}>
        Security
      </Box>
      <Box color="black" fontSize={0} mt={4} fontWeight={700}>
        Log out of this session
      </Box>
      <Box fontSize={0} mt={2} color="gray">
        You will be logged out of your Urbit on this browser
        <form method="post" action="/~/logout">
          <Button narrow mt={2} border={1}>
            Logout
          </Button>
        </form>
      </Box>
      <Box color="black" fontSize={0} mt={4} fontWeight={700}>
        Log out of all sessions
      </Box>
      <Box fontSize={0} mt={2} color="gray">
        You will be logged out of all browsers that have currently logged into
        your Urbit
        <form method="post" action="/~/logout">
          <Button error narrow mt={2} border={1}>
            Logout Everywhere
          </Button>
        </form>
      </Box>
    </>
  );
}
