/**
 * Ant Design Theme Configuration
 * Brand Color: #1b5e3f (PT Ratu Oki Green)
 */

const theme = {
  token: {
    colorPrimary: '#1b5e3f',
    colorSuccess: '#1b5e3f',
    borderRadius: 6,
    fontSize: 14,
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    colorBorder: '#d9d9d9',
    colorTextSecondary: '#8c8c8c',
  },
  components: {
    Button: {
      colorPrimary: '#1b5e3f',
      borderRadius: 6,
      controlHeight: 40,
    },
    Card: {
      borderRadiusLG: 8,
      boxShadow: '0 1px 2px rgba(0, 0, 0, 0.08)',
    },
    Layout: {
      headerBg: 'linear-gradient(135deg, #1b5e3f 0%, #2d7a52 100%)',
      headerHeight: 64,
      headerPadding: '0 24px',
      headerColor: '#ffffff',
    },
    Checkbox: {
      colorPrimary: '#1b5e3f',
    },
    Pagination: {
      itemActiveBg: '#1b5e3f',
      itemActiveBorderColor: '#1b5e3f',
    },
  },
};

export default theme;
