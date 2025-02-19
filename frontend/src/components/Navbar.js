// import React, { useState } from 'react';
// import LeftMenu from './LeftMenu';
// import RightMenu from './RightMenu';
// import { Drawer, Button } from 'antd';
// import { MenuOutlined } from '@ant-design/icons'; // ใช้แทน Icon type="align-right"

// const AppNavbar = () => {
//   const [visible, setVisible] = useState(false);

//   const showDrawer = () => {
//     setVisible(true);
//   };

//   const onClose = () => {
//     setVisible(false);
//   };

//   return (
//     <nav className="menu">
//       <div className="menu__logo">
//         <a href="">Logo</a>
//       </div>
//       <div className="menu__container">
//         <div className="menu_left">
//           <LeftMenu mode="horizontal" />
//         </div>
//         <div className="menu_right">
//           <RightMenu mode="horizontal" />
//         </div>
//         <Button
//           className="menu__mobile-button"
//           type="primary"
//           onClick={showDrawer}
//         >
//           <MenuOutlined /> {/* ใช้ MenuOutlined แทน Icon type="align-right" */}
//         </Button>
//         <Drawer
//           title="Basic Drawer"
//           placement="right"
//           className="menu_drawer"
//           closable={false}
//           onClose={onClose}
//           visible={visible}
//         >
//           <LeftMenu mode="inline" />
//           <RightMenu mode="inline" />
//         </Drawer>
//       </div>
//     </nav>
//   );
// };

// export default AppNavbar;
