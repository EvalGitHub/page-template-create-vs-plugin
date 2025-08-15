import { useState, useRef, useEffect } from "react";
import { Table, Input, Button, Space, Modal, Form, Select } from "antd";
import { mockData } from "./config";
import {debounce } from '@/utils';

let vscodeApi = null;

function getVsCodeApi() {
  if (!vscodeApi) {
    try {
      // eslint-disable-next-line no-undef
      vscodeApi = acquireVsCodeApi();
    } catch (e) {
      console.error("Failed to acquire VS Code API:", e);
    }
  }
  return vscodeApi;
}

export default function TemplateSelect() {
  const [query, setQuery] = useState("");
  const vscode = useRef(getVsCodeApi()).current;
  const [data] = useState(mockData);
  const [curPath, setCurPath] = useState("");
  const [loading, setLoading] = useState(false);
  const [curTargetRecord ,setCurTargetRecord]= useState({});
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
  });
  const [form] = Form.useForm();
  const [modalVisible, setModalVisible] = useState(false);

  const filteredData = data.filter((item) => item.name.includes(query));
  // const [pageInstallList, setPageInstallList] = useState(["~/src/pages"]);

  const columns = [
    {
      title: "模板名称",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "维护人",
      dataIndex: "maintainer",
      key: "maintainer",
    },
    {
      title: "更新时间",
      dataIndex: "updatedAt",
      key: "updatedAt",
    },
    {
      title: "操作",
      key: "action",
      render: (_, record) => (
        <Space>
          <Button
            color="primary"
            variant="dashed"
            onClick={() => handleViewSource(record)}
          >
            查看源码
          </Button>
          <Button
            color="default"
            variant="filled"
            onClick={() => handleUseTemplate(record)}
          >
            使用此模板
          </Button>
        </Space>
      ),
    },
  ];

  function handleViewSource(item) {
     if (typeof vscode !== "undefined" && vscode.postMessage) {
      vscode.postMessage({ actionName: "openUrlBlank", value: item.gitUrl });
     } else {
      console.warn("vscode 对象不可用，可能不在 VS Code 环境中");
     }
  }

  function handleUseTemplate(item) {
    form.setFieldsValue({
      templateName: item.name,
      installPath: curPath,
      pageName: undefined,
      template: item,
      gitUrl: item.gitUrl,
    });
    setCurTargetRecord(item);
    setModalVisible(true);
  }

  function handleModalCancel() {
    setModalVisible(false);
  }

  function handleModalOk() {
    form.validateFields().then((value) => {
      createPageHandle({
        value: {
          ...value,
          ...curTargetRecord,
        },
        actionName: "createPage",
      });
      // setModalVisible(false);
    });
  }

  function createPageHandle({ value, actionName }) {
    if (typeof vscode !== "undefined" && vscode.postMessage) {
      setLoading(true);
      vscode.postMessage({ actionName, value });
    } else {
      console.warn("vscode 对象不可用，可能不在 VS Code 环境中");
    }
  }

  // function getPagesDirList() {
  //   if (typeof vscode !== "undefined" && vscode.postMessage) {
  //     vscode.postMessage({ actionName: "getPageDirs", value: "src/pages" });
  //   } else {
  //     console.warn("vscode 对象不可用，可能不在 VS Code 环境中");
  //   }
  // }
 
  function handleTableChange(pag) {
    setPagination({
      ...pagination,
      current: pag.current,
      pageSize: pag.pageSize,
    });
  }

  function changePageName(e) {
    // 实现一个防抖函数
    debounce(() => {
     form.setFieldsValue({
       installPath: `${curPath}/${e.target.value}`,
     });
    }, 500)()
  }

  useEffect(() => {
    window.addEventListener("message", (event) => {
      const {data, type} = event.data;
      switch (type) {
        case "currentPath":
          setCurPath(data.path);
          break;
        case "getPageDirs":
          console.log("getPages", data);
          break;
        case "createPageSuccess":
          setLoading(false);
          setModalVisible(false);
          break;
        case "createPageFail":
          setLoading(false);
          break;
      }
    });
  }, []);

  return (
    <div
      style={{
        height: "100vh",
        padding: 10,
        margin: 0,
        background: "#fff",
        boxSizing: "border-box",
        overflow: "hidden",
        width: "99%",
      }}
    >
      <div>
        <h2 style={{ textAlign: "left" }}>选择模板</h2>
        <div style={{ marginBottom: 16, textAlign: "left" }}>
          <Space>
            <Input
              placeholder="请输入模板名称"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setPagination({ ...pagination, current: 1 });
              }}
              allowClear
              style={{ width: 240 }}
            />
            <Button type="primary">查询</Button>
          </Space>
        </div>
      </div>
      <Table
        scroll={{
          x: "max-content",
          y: "calc(100vh - 270px)",
        }}
        rowKey="id"
        columns={columns}
        dataSource={filteredData.slice(
          (pagination.current - 1) * pagination.pageSize,
          pagination.current * pagination.pageSize
        )}
        pagination={{
          current: pagination.current,
          pageSize: pagination.pageSize,
          total: filteredData.length,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total) => `共 ${total} 条`,
          pageSizeOptions: ["10", "20", "50", "100"],
          style: { marginBottom: 0 },
        }}
        onChange={handleTableChange}
      />

      <Modal
        title="使用模板"
        visible={modalVisible}
        onCancel={handleModalCancel}
        onOk={handleModalOk}
        confirmLoading={loading}
        okText={loading ? "正在创建中..." : "确认"}
        cancelText="取消"
      >
        <Form form={form} layout="vertical">
          <Form.Item label="模板名称" name="templateName">
            <Input disabled />
          </Form.Item>
          <Form.Item label="gitUrl" name="gitUrl">
            <Input disabled />
          </Form.Item>
          <Form.Item
            label="新建文件所在路径"
            name="installPath"
            rules={[{ required: true, message: "请选择安装路径" }]}
          >
            {/*      <Select placeholder="请选择安装路径">
              {pageInstallList.map(item => 
                <Select.Option value={item}>{item}</Select.Option>
              )}
            </Select> */}
            <Input.TextArea disabled />
          </Form.Item>
          <Form.Item
            label="页面名称"
            name="pageName"
            rules={[{ required: true, message: "请输入页面名称" }]}
          >
            <Input placeholder="页面名称：文件夹名称，建议使用aaa-bbb-ccc格式" onChange={changePageName}/>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
