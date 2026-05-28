import GroupsIcon from '@mui/icons-material/Groups';

// icons
const icons = {
    GroupsIcon,
};

// ==============================|| MENU ITEMS - UTILITIES ||============================== //

const teams = {
    id: 'team',
    title: 'Team',
    type: 'group',
    children: [
        {
            id: 'team',
            title: 'Team',
            type: 'item',
            url: '/team',
            icon: icons.GroupsIcon
        }
    ]
};

export default teams;
