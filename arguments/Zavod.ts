// [VehicleType memory _transportType, VehicleColor memory _color, uint256 _price]
type argsArray = [number, number, string];

export enum VehicleType {
  NONE,
  BIKE,
  CAR,
}
export enum VehicleColor {
  NONE,
  RED,
  BLUE,
  YELLOW,
}

export default [
  VehicleType.BIKE,
  VehicleColor.RED,
  "100000000000000000000",
] as argsArray;
