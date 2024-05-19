import { createTheme } from "@mui/material"

export const Colors = {
    primary : '#3d4761',
    secondary : '#679b52',
    white : '#fff',
    black : '#000',
    background : '#f5fbfc',
    border : '#a6a6a6',
    defaultIconColor : '004aad',
    dottedColor : '#e4e4e4'
}

const theme = createTheme({
    palette: {
        primary: {
            main : Colors.primary
        },
        secondary : {
            main : Colors.secondary
        }
    }
})

export default theme;
