import AirplanemodeActiveIcon from '@mui/icons-material/AirplanemodeActive';
import CategoryOutlinedIcon from '@mui/icons-material/CategoryOutlined';

// icons
const icons = {
  AirplanemodeActiveIcon,
  CategoryOutlinedIcon
};

// ==============================|| MENU ITEMS - UTILITIES ||============================== //

const utilities = {
  id: 'aircraft',
  title: 'Aircraft',
  type: 'group',
  children: [
    {
      id: 'aircraft',
      title: 'Aircraft',
      type: 'item',
      url: '/aircraft',
      icon: icons.AirplanemodeActiveIcon
    },
    {
      id: 'make',
      title: 'Make',
      type: 'item',
      url: '/make',
      icon: icons.CategoryOutlinedIcon
    }
  ]
};

export default utilities;
