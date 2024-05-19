import { Icon } from "@iconify/react/dist/iconify.js"
import { Stack, Typography } from "@mui/material"
import { useNavigate } from "react-router-dom";

const Hearder = ({title} : {title : string}) => {

    const navigate = useNavigate();

    return (
        <Stack direction={'row'} alignItems={'center'} justifyContent={'center'} width={'70%'} mt={4}>
            <Icon width={24} icon="icon-park-solid:back" onClick={() => navigate("/")} style={{ flex: 1, cursor: 'pointer' }} />
            <Typography textAlign={'center'} variant='h3' fontWeight={'bold'} sx={{ flex: 9 }}>{title}</Typography>
        </Stack>
    )
}

export default Hearder