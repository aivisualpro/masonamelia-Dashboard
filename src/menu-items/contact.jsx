import CallIcon from '@mui/icons-material/Call';

// icons
const icons = {
    CallIcon,
};

// ==============================|| MENU ITEMS - UTILITIES ||============================== //

const testimonials = {
    id: 'contact-info',
    title: 'Contact Info',
    type: 'group',
    children: [
        {
            id: 'contact-info',
            title: 'Contact Info',
            type: 'item',
            url: '/contact-info',
            icon: icons.CallIcon
        }
    ]
};

export default testimonials;
