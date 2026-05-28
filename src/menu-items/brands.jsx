import PhotoLibraryIcon from '@mui/icons-material/PhotoLibrary';

// icons
const icons = {
    PhotoLibraryIcon,
};

// ==============================|| MENU ITEMS - UTILITIES ||============================== //

const brands = {
    id: 'logo-ticker',
    title: 'Logo Ticker',
    type: 'group',
    children: [
        {
            id: 'logo-ticker',
            title: 'Logo Ticker',
            type: 'item',
            url: '/logo-ticker',
            icon: icons.PhotoLibraryIcon
        }
    ]
};

export default brands;
