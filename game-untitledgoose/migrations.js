"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.migrate020 = void 0;
const path_1 = __importDefault(require("path"));
const semver_1 = __importDefault(require("semver"));
const vortex_api_1 = require("vortex-api");
const statics_1 = require("./statics");
const util_1 = require("./util");
function migrate020(context, oldVersion) {
    if (semver_1.default.gte(oldVersion, '0.2.0')) {
        return Promise.resolve();
    }
    const discoveryPath = (0, util_1.getDiscoveryPath)(context.api.getState());
    if (discoveryPath === undefined) {
        return Promise.resolve();
    }
    const modsPath = path_1.default.join(discoveryPath, statics_1.DATAPATH, 'VortexMods');
    return context.api.awaitUI()
        .then(() => vortex_api_1.fs.ensureDirWritableAsync(modsPath))
        .then(() => context.api.emitAndAwait('purge-mods-in-path', statics_1.GAME_ID, '', modsPath));
}
exports.migrate020 = migrate020;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWlncmF0aW9ucy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIm1pZ3JhdGlvbnMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQ0EsZ0RBQXdCO0FBQ3hCLG9EQUE0QjtBQUM1QiwyQ0FBZ0M7QUFFaEMsdUNBQTJEO0FBQzNELGlDQUEwQztBQTBCMUMsU0FBZ0IsVUFBVSxDQUFDLE9BQU8sRUFBRSxVQUFVO0lBQzVDLElBQUksZ0JBQU0sQ0FBQyxHQUFHLENBQUMsVUFBVSxFQUFFLE9BQU8sQ0FBQyxFQUFFO1FBQ25DLE9BQU8sT0FBTyxDQUFDLE9BQU8sRUFBRSxDQUFDO0tBQzFCO0lBRUQsTUFBTSxhQUFhLEdBQUcsSUFBQSx1QkFBZ0IsRUFBQyxPQUFPLENBQUMsR0FBRyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUM7SUFDL0QsSUFBSSxhQUFhLEtBQUssU0FBUyxFQUFFO1FBRy9CLE9BQU8sT0FBTyxDQUFDLE9BQU8sRUFBRSxDQUFDO0tBQzFCO0lBQ0QsTUFBTSxRQUFRLEdBQUcsY0FBSSxDQUFDLElBQUksQ0FBQyxhQUFhLEVBQUUsa0JBQVEsRUFBRSxZQUFZLENBQUMsQ0FBQztJQUVsRSxPQUFPLE9BQU8sQ0FBQyxHQUFHLENBQUMsT0FBTyxFQUFFO1NBQ3pCLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQyxlQUFFLENBQUMsc0JBQXNCLENBQUMsUUFBUSxDQUFDLENBQUM7U0FDL0MsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDLG9CQUFvQixFQUFFLGlCQUFPLEVBQUUsRUFBRSxFQUFFLFFBQVEsQ0FBQyxDQUFDLENBQUM7QUFDdkYsQ0FBQztBQWhCRCxnQ0FnQkMiLCJzb3VyY2VzQ29udGVudCI6WyIvLyBpbXBvcnQgeyBydW5QYXRjaGVyIH0gZnJvbSAnaGFybW9ueS1wYXRjaGVyJztcclxuaW1wb3J0IHBhdGggZnJvbSAncGF0aCc7XHJcbmltcG9ydCBzZW12ZXIgZnJvbSAnc2VtdmVyJztcclxuaW1wb3J0IHsgZnMgfSBmcm9tICd2b3J0ZXgtYXBpJztcclxuXHJcbmltcG9ydCB7IERBVEFQQVRILCBFTlRSWV9QT0lOVCwgR0FNRV9JRCB9IGZyb20gJy4vc3RhdGljcyc7XHJcbmltcG9ydCB7IGdldERpc2NvdmVyeVBhdGggfSBmcm9tICcuL3V0aWwnO1xyXG5cclxuLypcclxuZXhwb3J0IGZ1bmN0aW9uIG1pZ3JhdGUwMTAoY29udGV4dCwgb2xkVmVyc2lvbikge1xyXG4gIGlmIChzZW12ZXIuZ3RlKG9sZFZlcnNpb24sICcwLjEuMCcpKSB7XHJcbiAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKCk7XHJcbiAgfVxyXG5cclxuICBjb25zdCBzdGF0ZSA9IGNvbnRleHQuYXBpLnN0b3JlLmdldFN0YXRlKCk7XHJcbiAgY29uc3QgZGlzY292ZXJ5UGF0aCA9IGdldERpc2NvdmVyeVBhdGgoc3RhdGUpO1xyXG4gIGlmIChkaXNjb3ZlcnlQYXRoID09PSB1bmRlZmluZWQpIHtcclxuICAgIC8vIEdhbWUgd2FzIG5vdCBkaXNjb3ZlcmVkLCB0aGlzIGlzIGEgdmFsaWQgdXNlIGNhc2UuXHJcbiAgICAvLyAgVXNlciBtaWdodCBub3Qgb3duIHRoZSBnYW1lLlxyXG4gICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgpO1xyXG4gIH1cclxuXHJcbiAgY29uc3QgYWJzUGF0aCA9IHBhdGguam9pbihkaXNjb3ZlcnlQYXRoLCBEQVRBUEFUSCk7XHJcbiAgY29uc3QgYXNzZW1ibHlQYXRoID0gcGF0aC5qb2luKGFic1BhdGgsICdWb3J0ZXhIYXJtb255SW5zdGFsbGVyLmRsbCcpO1xyXG4gIC8vIFRlc3QgaWYgdGhlIHBhdGNoIGV4aXN0cyBhbmQgcmVtb3ZlIGl0LCBpZiBpdCBpcy5cclxuICByZXR1cm4gZnMuc3RhdEFzeW5jKGFzc2VtYmx5UGF0aClcclxuICAgIC50aGVuKCgpID0+IHJ1blBhdGNoZXIoX19kaXJuYW1lLCBhYnNQYXRoLCBFTlRSWV9QT0lOVCwgdHJ1ZSxcclxuICAgICAgcGF0aC5qb2luKGdldERpc2NvdmVyeVBhdGgoc3RhdGUpLCBEQVRBUEFUSCwgJ1ZvcnRleE1vZHMnKSkpXHJcbiAgICAuY2F0Y2goZXJyID0+IGVyci5jb2RlID09PSAnRU5PRU5UJyA/IFByb21pc2UucmVzb2x2ZSgpIDogUHJvbWlzZS5yZWplY3QoZXJyKSk7XHJcbn1cclxuKi9cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBtaWdyYXRlMDIwKGNvbnRleHQsIG9sZFZlcnNpb24pIHtcclxuICBpZiAoc2VtdmVyLmd0ZShvbGRWZXJzaW9uLCAnMC4yLjAnKSkge1xyXG4gICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgpO1xyXG4gIH1cclxuXHJcbiAgY29uc3QgZGlzY292ZXJ5UGF0aCA9IGdldERpc2NvdmVyeVBhdGgoY29udGV4dC5hcGkuZ2V0U3RhdGUoKSk7XHJcbiAgaWYgKGRpc2NvdmVyeVBhdGggPT09IHVuZGVmaW5lZCkge1xyXG4gICAgLy8gR2FtZSB3YXMgbm90IGRpc2NvdmVyZWQsIHRoaXMgaXMgYSB2YWxpZCB1c2UgY2FzZS5cclxuICAgIC8vICBVc2VyIG1pZ2h0IG5vdCBvd24gdGhlIGdhbWUuXHJcbiAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKCk7XHJcbiAgfVxyXG4gIGNvbnN0IG1vZHNQYXRoID0gcGF0aC5qb2luKGRpc2NvdmVyeVBhdGgsIERBVEFQQVRILCAnVm9ydGV4TW9kcycpO1xyXG5cclxuICByZXR1cm4gY29udGV4dC5hcGkuYXdhaXRVSSgpXHJcbiAgICAudGhlbigoKSA9PiBmcy5lbnN1cmVEaXJXcml0YWJsZUFzeW5jKG1vZHNQYXRoKSlcclxuICAgIC50aGVuKCgpID0+IGNvbnRleHQuYXBpLmVtaXRBbmRBd2FpdCgncHVyZ2UtbW9kcy1pbi1wYXRoJywgR0FNRV9JRCwgJycsIG1vZHNQYXRoKSk7XHJcbn1cclxuIl19