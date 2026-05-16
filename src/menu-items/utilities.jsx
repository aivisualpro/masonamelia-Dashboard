import AirplanemodeActiveIcon from '@mui/icons-material/AirplanemodeActive';
import CategoryOutlinedIcon from '@mui/icons-material/CategoryOutlined';

// icons
const icons = {
  AirplanemodeActiveIcon,
  CategoryOutlinedIcon
};

// ==============================|| MENU ITEMS - UTILITIES ||============================== //

const utilities = {
  id: 'aircrafts',
  title: 'Aircrafts',
  type: 'group',
  children: [
    {
      id: 'aircrafts',
      title: 'Aircrafts',
      type: 'item',
      url: '/aircrafts',
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
