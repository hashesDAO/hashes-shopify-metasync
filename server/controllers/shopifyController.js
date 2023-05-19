"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TraderController = void 0;
const tsoa_1 = require("tsoa");
//   import { CoinAddressApiModel } from "../models/CoinAddressApiModel";
//   const { getEarlyTradersForCoins, getDebankForAddresses } = require('../services/FindTradersService')
let TraderController = class TraderController extends tsoa_1.Controller {
    async findEarlyBuyersForCoins() {
        return "test";
    }
    async findWhaleBuyersDuringTimeFrame(coins) {
        return "test";
    }
};
__decorate([
    (0, tsoa_1.Post)("early"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], TraderController.prototype, "findEarlyBuyersForCoins", null);
__decorate([
    (0, tsoa_1.Post)("whales"),
    __param(0, (0, tsoa_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TraderController.prototype, "findWhaleBuyersDuringTimeFrame", null);
TraderController = __decorate([
    (0, tsoa_1.Route)("traders")
], TraderController);
exports.TraderController = TraderController;
