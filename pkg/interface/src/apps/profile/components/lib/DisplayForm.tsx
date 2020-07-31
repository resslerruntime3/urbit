import React, { useCallback } from "react";

import {
  Input,
  Box,
  Center,
  Col,
  InputLabel,
  Radio,
  Checkbox,
  Button,
} from "@tlon/indigo-react";

import { Formik, Form } from "formik";
import * as Yup from "yup";
import _ from "lodash";
import GlobalApi from "../../../../api/global";
import { BackgroundConfig } from "../../../../types/local-update";
import { LaunchState } from "../../../../types/launch-update";

const tiles = ["publish", "links", "chat", "dojo", "clock", "weather"];

const formSchema = Yup.object().shape({
  order: Yup.string()
    .required("Required")
    .test(
      "tiles",
      "Invalid tile ordering",
      (o: string = "") =>
        _.difference(
          o.split(", ").map((i) => i.trim()),
          tiles
        ).length === 0
    ),
  bgType: Yup.string()
    .oneOf(["none", "color", "url"], "invalid")
    .required("Required"),
  bgUrl: Yup.string().url(),
  bgColor: Yup.string().matches(/#([A-F]|[a-f]|[0-9]){6}/, "Invalid color"),
  avatars: Yup.boolean(),
  nicknames: Yup.boolean(),
});

type BgType = "none" | "url" | "color";

interface FormSchema {
  order: string;
  bgType: BgType;
  bgColor: string | undefined;
  bgUrl: string | undefined;
  avatars: boolean;
  nicknames: boolean;
}

interface DisplayFormProps {
  api: GlobalApi;
  launch: LaunchState;
  dark: boolean;
  background: BackgroundConfig;
  hideAvatars: boolean;
  hideNicknames: boolean;
}

function ImagePicker({ url }: { url: string }) {
  return (
    <Center
      width="250px"
      height="250px"
      p={3}
      backgroundImage={`url('${url}')`}
      backgroundSize="cover"
    >
      <Box>Change</Box>
    </Center>
  );
}

function BackgroundPicker({
  bgType,
  bgUrl,
}: {
  bgType: BgType;
  bgUrl?: string;
}) {
  return (
    <Box>
      <InputLabel>Landscape Background</InputLabel>
      <Box display="flex" alignItems="center">
        <Box mt={3} mr={10}>
          <Radio label="Image" id="url" name="bgType" />
          <Radio label="Color" id="color" name="bgType" />
          <Radio label="None" id="none" name="bgType" />
        </Box>
        {bgType === "url" && (
          <Col>
            <Input ml={4} type="text" label="URL" id="bgUrl" name="bgUrl" />
            {/*<ImagePicker  url={bgUrl || ''} />*/}
          </Col>
        )}
        {bgType === "color" && (
          <Input ml={4} type="text" label="Color" id="bgColor" name="bgColor" />
        )}
      </Box>
    </Box>
  );
}

export default function DisplayForm(props: DisplayFormProps) {
  const { api, launch, background, hideAvatars, hideNicknames } = props;

  const initialOrder = launch.tileOrdering.join(", ");
  let bgColor, bgUrl;
  if (background?.type === "url") {
    bgUrl = background.url;
  }
  if (background?.type === "color") {
    bgColor = background.color;
  }
  const bgType = background?.type || "none";

  const logoutAll = useCallback(() => {}, []);

  return (
    <Formik
      validationSchema={formSchema}
      initialValues={
        {
          order: initialOrder,
          bgType,
          bgColor,
          bgUrl,
          avatars: hideAvatars,
          nicknames: hideNicknames,
        } as FormSchema
      }
      onSubmit={(values, actions) => {
        api.launch.changeOrder(values.order.split(", "));

        const bgConfig: BackgroundConfig =
          values.bgType === "color"
            ? { type: "color", color: values.bgColor || "" }
            : values.bgType === "url"
            ? { type: "url", url: values.bgUrl || "" }
            : undefined;

        api.local.setBackground(bgConfig);
        api.local.hideAvatars(values.avatars);
        api.local.hideNicknames(values.nicknames);
        api.local.dehydrate();
        actions.setSubmitting(false);
      }}
    >
      {(props) => (
        <Form>
          <Box
            display="grid"
            gridTemplateColumns="1fr"
            gridTemplateRows="auto"
            gridRowGap={2}
          >
            <Box color="black" fontSize={1} mb={4} fontWeight={900}>
              Display Preferences
            </Box>

            <Box>
              <Input
                label="Home Tile Order"
                id="order"
                mt={2}
                type="text"
                width={256}
              />
            </Box>
            <BackgroundPicker
              bgType={props.values.bgType}
              bgUrl={props.values.bgUrl}
            />
            <Box mt={3}>
              <Checkbox
                mt={3}
                label="Disable avatars"
                id="avatars"
                caption="Do not show user-set avatars"
              />
              <Checkbox
                mt={3}
                label="Disable nicknames"
                id="nicknames"
                caption="Do not show user-set nicknames"
              />
            </Box>
          </Box>
          <Button
            onClick={logoutAll}
            border={1}
            borderColor="washedGray"
            type="submit"
          >
            Submit
          </Button>
        </Form>
      )}
    </Formik>
  );
}
