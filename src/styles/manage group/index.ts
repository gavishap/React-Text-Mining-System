import { Box, Modal, styled } from "@mui/material";
import { Colors } from "../theme";

export const AddModalBox = styled(Modal)(()=>({
    display : 'flex',
    justifyContent : 'center',
    alignItems : 'center',
}));

export const AddModalContainer = styled(Box)(({theme}) => ({
    width : '30%',
    backgroundColor : Colors.white,
    borderRadius : theme.shape.borderRadius,
    padding : 16,
    flexDirection: 'column',
    display: 'flex',
    alignItems: 'center'
}));