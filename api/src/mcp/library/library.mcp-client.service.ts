import { Injectable } from "@nestjs/common";
import { GenericMcpClientService } from "../generic.mcp-client.service";

@Injectable()
export class LibraryMcpClientService extends GenericMcpClientService {}
