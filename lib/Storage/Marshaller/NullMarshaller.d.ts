import MarshallerInterface = require("./MarshallerInterface");

declare class NullMarshaller implements MarshallerInterface {
    /**
     * @inheritdoc
     */
    marshall(value: any): string;

    /**
     * @inheritdoc
     */
    unmarshall(value: string): any;
}

export = NullMarshaller;