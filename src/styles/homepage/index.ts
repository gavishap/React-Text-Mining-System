import { Box, Modal, styled } from "@mui/material";
import { Colors } from "../../styles/theme";

export const ModalBox = styled(Modal)(()=>({
    display : 'flex',
    justifyContent : 'center',
    alignItems : 'center',
}));

export const ModalContainer = styled(Box)(({theme}) => ({
    width : '40%',
    backgroundColor : Colors.white,
    borderRadius : theme.shape.borderRadius,
    padding : 16,
    flexDirection: 'column'
}));

export const UploadInput = styled(Box)({
    height : 100,
    padding : 16,
    borderStyle : 'dotted',
    borderColor : Colors.border,
    borderWidth : 2,
    display : 'flex',
    justifyContent: 'center',
    alignItems : 'center',
    flexDirection : 'column'
});