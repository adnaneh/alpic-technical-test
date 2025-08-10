import { Injectable } from "@nestjs/common";
import { GenericMcpClientService } from "../generic.mcp-client.service";

@Injectable()
export class PlaybackMcpClientService extends GenericMcpClientService {}
