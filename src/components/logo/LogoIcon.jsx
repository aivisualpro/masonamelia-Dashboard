// material-ui
import { useTheme } from '@mui/material/styles';
const logoSrc = "/assets/images/logoIcon.avif";



export default function LogoIcon() {
  const theme = useTheme();

  return (
    <>
      <img style={{ maxWidth: "50px" }} src={logoSrc} alt="" />
    </>
  );
}
