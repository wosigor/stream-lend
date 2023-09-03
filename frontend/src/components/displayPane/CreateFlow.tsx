import React from "react";
import { Button, Form, Input, message } from "antd";
import { useWeb3React } from "@web3-react/core";
import { Web3Provider } from "@ethersproject/providers";
import { Framework } from "@superfluid-finance/sdk-core";

const CreateFlow: React.FC = () => {
  const [form] = Form.useForm();
  const { provider, account, chainId } = useWeb3React<Web3Provider>();

  const onFinish = async (values: any) => {
    const { recipient, flowRate } = values;

    if (!provider || !account || !chainId) {
      message.error("Library, account, or chainId missing.");
      return;
    }

    const sf = await Framework.create({
      chainId: chainId,
      provider: provider
    });

    const daix = await sf.loadSuperToken("fDAIx");
    const signer = provider.getSigner();

    try {
      const superSigner = sf.createSigner({ signer });
      const createFlowOperation = daix.createFlow({
        sender: await superSigner.getAddress(),
        receiver: recipient,
        flowRate: flowRate,
        overrides: {
          gasLimit: 50000000
        }
      });

      const response = await createFlowOperation.exec(superSigner, 100);
      console.log("Flow created successfully!", response);
      message.success("Stream created successfully!");
    } catch (error) {
      console.error("Error creating flow:", error);
      // message.error("Error creating stream: " + error.message);
    }
  };

  return (
    <div>
      <Form layout="vertical" form={form} onFinish={onFinish}>
        <Form.Item
          label="Recipient Address"
          name="recipient"
          rules={[{ required: true, message: "Please input the recipient address!" }]}
        >
          <Input placeholder="Enter recipient address" />
        </Form.Item>
        <Form.Item
          label="Flow Rate"
          name="flowRate"
          rules={[{ required: true, message: "Please input the flow rate!" }]}
        >
          <Input type="number" placeholder="Enter flow rate" />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit">
            Create Stream
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default CreateFlow;
