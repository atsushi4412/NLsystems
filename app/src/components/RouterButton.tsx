import React from "react";
import { Button ,SxProps,Theme} from "@mui/material";
import {Link} from "react-router-dom";
import { color } from "@mui/system";
import { ButtonClasses } from "@mui/material/Button";

type Props = {
    to:string;
    shape:any;
    sx?:SxProps<Theme>;
    content:React.ReactNode;
};

const RouterButton:React.FC<Props> = ({to,shape,sx,content}) => {
    return (
        <Button  component={Link} to={to} variant={shape} sx={sx}>{content}</Button>
    );
}

export default RouterButton;