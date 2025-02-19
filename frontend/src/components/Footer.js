import React from 'react';
import { Layout, Typography, Space } from 'antd';

const { Footer } = Layout;
const { Text } = Typography;

const AppFooter = () => {
  return (
    <Layout>
      <Footer style={{ textAlign: 'center' }}>
        <Space direction="vertical" size="middle">
          <Text>© 2025 Your Company</Text>
          <Text type="secondary">All Rights Reserved</Text>
        </Space>
      </Footer>
    </Layout>
  );
};

export default AppFooter;
