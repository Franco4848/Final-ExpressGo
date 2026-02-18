import { ArrayMinSize, IsArray, IsMongoId } from "class-validator";

export class ReorderRouteDto {
  @IsArray()
  @ArrayMinSize(1)
  @IsMongoId({ each: true })
  orderedPackageIds: string[];
}
