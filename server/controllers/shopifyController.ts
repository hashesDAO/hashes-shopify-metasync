import {
    Body,
    Controller,
    Get,
    Path,
    Post,
    Query,
    Route,
    SuccessResponse,
  } from "tsoa";
//   import { CoinAddressApiModel } from "../models/CoinAddressApiModel";
  
//   const { getEarlyTradersForCoins, getDebankForAddresses } = require('../services/FindTradersService')
  
  @Route("traders")
  export class TraderController extends Controller{
  
    @Post("early")
    public async findEarlyBuyersForCoins(
    ): Promise<string> {
      return "test"
    }
  
    @Post("whales")
    public async findWhaleBuyersDuringTimeFrame(
      @Body() coins: string
    ): Promise<string> {
      return "test"
    }
  }