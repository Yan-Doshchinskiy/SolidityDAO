// [string name, string symbol, address _bridgeAddress]
type argsArray = [string, string, number, number, number];

const DaoToken = process.env.DAO_TOKEN_ADDRESS as string;

export default [DaoToken, "100000000000000000000", 10, 86400, 50] as argsArray;
