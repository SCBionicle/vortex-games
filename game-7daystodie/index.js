"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const react_redux_1 = require("react-redux");
const vortex_api_1 = require("vortex-api");
const React = __importStar(require("react"));
const actions_1 = require("./actions");
const reducers_1 = require("./reducers");
const common_1 = require("./common");
const loadOrder_1 = require("./loadOrder");
const migrations_1 = require("./migrations");
const util_1 = require("./util");
const STEAM_ID = '251570';
const STEAM_DLL = 'steamclient64.dll';
const ROOT_MOD_CANDIDATES = ['bepinex'];
function resetPrefixOffset(api) {
    var _a;
    const state = api.getState();
    const profileId = (_a = vortex_api_1.selectors.activeProfile(state)) === null || _a === void 0 ? void 0 : _a.id;
    if (profileId === undefined) {
        api.showErrorNotification('No active profile for 7dtd', undefined, { allowReport: false });
        return;
    }
    api.store.dispatch((0, actions_1.setPrefixOffset)(profileId, 0));
    const loadOrder = vortex_api_1.util.getSafe(api.getState(), ['persistent', 'loadOrder', profileId], []);
    const newLO = loadOrder.map((entry, idx) => (Object.assign(Object.assign({}, entry), { data: {
            prefix: (0, util_1.makePrefix)(idx),
        } })));
    api.store.dispatch(vortex_api_1.actions.setLoadOrder(profileId, newLO));
}
function setPrefixOffsetDialog(api) {
    return api.showDialog('question', 'Set New Prefix Offset', {
        text: api.translate('Insert new prefix offset for modlets (AAA-ZZZ):'),
        input: [
            {
                id: '7dtdprefixoffsetinput',
                label: 'Prefix Offset',
                type: 'text',
                placeholder: 'AAA',
            }
        ],
    }, [{ label: 'Cancel' }, { label: 'Set', default: true }])
        .then(result => {
        var _a;
        if (result.action === 'Set') {
            const prefix = result.input['7dtdprefixoffsetinput'];
            let offset = 0;
            try {
                offset = (0, util_1.reversePrefix)(prefix);
            }
            catch (err) {
                return Promise.reject(err);
            }
            const state = api.getState();
            const profileId = (_a = vortex_api_1.selectors.activeProfile(state)) === null || _a === void 0 ? void 0 : _a.id;
            if (profileId === undefined) {
                api.showErrorNotification('No active profile for 7dtd', undefined, { allowReport: false });
                return;
            }
            api.store.dispatch((0, actions_1.setPrefixOffset)(profileId, offset));
            const loadOrder = vortex_api_1.util.getSafe(api.getState(), ['persistent', 'loadOrder', profileId], []);
            const newLO = loadOrder.map(entry => (Object.assign(Object.assign({}, entry), { data: {
                    prefix: (0, util_1.makePrefix)((0, util_1.reversePrefix)(entry.data.prefix) + offset),
                } })));
            api.store.dispatch(vortex_api_1.actions.setLoadOrder(profileId, newLO));
        }
        return Promise.resolve();
    })
        .catch(err => {
        api.showErrorNotification('Failed to set prefix offset', err, { allowReport: false });
        return Promise.resolve();
    });
}
function findGame() {
    return __awaiter(this, void 0, void 0, function* () {
        return vortex_api_1.util.GameStoreHelper.findByAppId([STEAM_ID])
            .then(game => game.gamePath);
    });
}
function parseAdditionalParameters(parameters) {
    var _a, _b;
    const udfParam = parameters.split('-').find(param => param.startsWith('UserDataFolder='));
    const udf = udfParam ? (_b = (_a = udfParam.split('=')) === null || _a === void 0 ? void 0 : _a[1]) === null || _b === void 0 ? void 0 : _b.trimEnd() : undefined;
    return (udf && path_1.default.isAbsolute(udf)) ? udf : undefined;
}
function prepareForModding(context, discovery) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        const requiresRestart = vortex_api_1.util.getSafe(context.api.getState(), ['settings', '7daystodie', 'udf'], undefined) === undefined;
        const launcherSettings = (0, common_1.launcherSettingsFilePath)();
        const relaunchExt = () => {
            return context.api.showDialog('info', 'Restart Required', {
                text: 'The extension requires a restart to complete the UDF setup. '
                    + 'The extension will now exit - please re-activate it via the games page or dashboard.',
            }, [{ label: 'Restart Extension' }])
                .then(() => {
                return Promise.reject(new vortex_api_1.util.ProcessCanceled('Restart required'));
            });
        };
        const selectUDF = () => __awaiter(this, void 0, void 0, function* () {
            const res = yield context.api.showDialog('info', 'Choose User Defined Folder', {
                text: 'The modding pattern for 7DTD is changing. The Mods path inside the game directory '
                    + 'is being deprecated and mods located in the old path will no longer work in the near '
                    + 'future. Please select your User Defined Folder (UDF) - Vortex will deploy to this new location.',
            }, [
                { label: 'Cancel' },
                { label: 'Select UDF' },
            ]);
            if (res.action !== 'Select UDF') {
                return Promise.reject(new vortex_api_1.util.ProcessCanceled('Cannot proceed without UFD'));
            }
            yield vortex_api_1.fs.ensureDirWritableAsync(path_1.default.dirname(launcherSettings));
            yield (0, util_1.ensureLOFile)(context);
            const directory = yield context.api.selectDir({
                title: 'Select User Data Folder',
                defaultPath: path_1.default.join(path_1.default.dirname(launcherSettings)),
            });
            if (!directory) {
                return Promise.reject(new vortex_api_1.util.ProcessCanceled('Cannot proceed without UFD'));
            }
            yield vortex_api_1.fs.ensureDirWritableAsync(path_1.default.join(directory, 'Mods'));
            const launcher = common_1.DEFAULT_LAUNCHER_SETTINGS;
            launcher.DefaultRunConfig.AdditionalParameters = `-UserDataFolder=${directory}`;
            const launcherData = JSON.stringify(launcher, null, 2);
            yield vortex_api_1.fs.writeFileAsync(launcherSettings, launcherData, { encoding: 'utf8' });
            context.api.store.dispatch((0, actions_1.setUDF)(directory));
            return (requiresRestart) ? relaunchExt() : Promise.resolve();
        });
        try {
            const data = yield vortex_api_1.fs.readFileAsync(launcherSettings, { encoding: 'utf8' });
            const settings = JSON.parse(data);
            if (((_a = settings === null || settings === void 0 ? void 0 : settings.DefaultRunConfig) === null || _a === void 0 ? void 0 : _a.AdditionalParameters) !== undefined) {
                const udf = parseAdditionalParameters(settings.DefaultRunConfig.AdditionalParameters);
                if (!!udf) {
                    yield vortex_api_1.fs.ensureDirWritableAsync(path_1.default.join(udf, 'Mods'));
                    yield (0, util_1.ensureLOFile)(context);
                    context.api.store.dispatch((0, actions_1.setUDF)(udf));
                    return (requiresRestart) ? relaunchExt() : Promise.resolve();
                }
                else {
                    return selectUDF();
                }
            }
        }
        catch (err) {
            return selectUDF();
        }
    });
}
function installContent(files, destinationPath, gameId) {
    return __awaiter(this, void 0, void 0, function* () {
        const modFile = files.find(file => path_1.default.basename(file).toLowerCase() === common_1.MOD_INFO);
        const rootPath = path_1.default.dirname(modFile);
        return (0, util_1.getModName)(path_1.default.join(destinationPath, modFile))
            .then(modName => {
            modName = modName.replace(/[^a-zA-Z0-9]/g, '');
            const filtered = files.filter(filePath => filePath.startsWith(rootPath) && !filePath.endsWith(path_1.default.sep));
            const instructions = filtered.map(filePath => {
                return {
                    type: 'copy',
                    source: filePath,
                    destination: path_1.default.relative(rootPath, filePath),
                };
            });
            return Promise.resolve({ instructions });
        });
    });
}
function testSupportedContent(files, gameId) {
    const supported = (gameId === common_1.GAME_ID) &&
        (files.find(file => path_1.default.basename(file).toLowerCase() === common_1.MOD_INFO) !== undefined);
    return Promise.resolve({
        supported,
        requiredFiles: [],
    });
}
function findCandFile(files) {
    return files.find(file => file.toLowerCase().split(path_1.default.sep)
        .find(seg => ROOT_MOD_CANDIDATES.includes(seg)) !== undefined);
}
function hasCandidate(files) {
    const candidate = findCandFile(files);
    return candidate !== undefined;
}
function installRootMod(files, gameId) {
    return __awaiter(this, void 0, void 0, function* () {
        const filtered = files.filter(file => !file.endsWith(path_1.default.sep));
        const candidate = findCandFile(files);
        const candIdx = candidate.toLowerCase().split(path_1.default.sep)
            .findIndex(seg => ROOT_MOD_CANDIDATES.includes(seg));
        const instructions = filtered.reduce((accum, iter) => {
            accum.push({
                type: 'copy',
                source: iter,
                destination: iter.split(path_1.default.sep).slice(candIdx).join(path_1.default.sep),
            });
            return accum;
        }, []);
        return Promise.resolve({ instructions });
    });
}
function testRootMod(files, gameId) {
    return __awaiter(this, void 0, void 0, function* () {
        return Promise.resolve({
            requiredFiles: [],
            supported: hasCandidate(files) && gameId === common_1.GAME_ID,
        });
    });
}
function toLOPrefix(context, mod) {
    var _a;
    const props = (0, util_1.genProps)(context);
    if (props === undefined) {
        return 'ZZZZ-' + mod.id;
    }
    const loadOrder = vortex_api_1.util.getSafe(props.state, ['persistent', 'loadOrder', props.profile.id], []);
    let loEntry = loadOrder.find(loEntry => loEntry.id === mod.id);
    if (loEntry === undefined) {
        const prev = vortex_api_1.util.getSafe(props.state, ['settings', '7daystodie', 'previousLO', props.profile.id], []);
        loEntry = prev.find(loEntry => loEntry.id === mod.id);
    }
    return (((_a = loEntry === null || loEntry === void 0 ? void 0 : loEntry.data) === null || _a === void 0 ? void 0 : _a.prefix) !== undefined)
        ? loEntry.data.prefix + '-' + mod.id
        : 'ZZZZ-' + mod.id;
}
function requiresLauncher(gamePath) {
    return vortex_api_1.fs.readdirAsync(gamePath)
        .then(files => (files.find(file => file.endsWith(STEAM_DLL)) !== undefined)
        ? Promise.resolve({ launcher: 'steam' })
        : Promise.resolve(undefined))
        .catch(err => Promise.reject(err));
}
function InfoPanel(props) {
    const { t, currentOffset } = props;
    return (React.createElement("div", { style: { display: 'flex', flexDirection: 'column', padding: '16px' } },
        React.createElement("div", { style: { display: 'flex', whiteSpace: 'nowrap', alignItems: 'center' } },
            t('Current Prefix Offset: '),
            React.createElement("hr", null),
            React.createElement("label", { style: { color: 'red' } }, currentOffset)),
        React.createElement("hr", null),
        React.createElement("div", null, t('7 Days to Die loads mods in alphabetic order so Vortex prefixes '
            + 'the directory names with "AAA, AAB, AAC, ..." to ensure they load in the order you set here.'))));
}
function InfoPanelWrap(props) {
    const { api, profileId } = props;
    const currentOffset = (0, react_redux_1.useSelector)((state) => (0, util_1.makePrefix)(vortex_api_1.util.getSafe(state, ['settings', '7daystodie', 'prefixOffset', profileId], 0)));
    return (React.createElement(InfoPanel, { t: api.translate, currentOffset: currentOffset }));
}
function main(context) {
    context.registerReducer(['settings', '7daystodie'], reducers_1.reducer);
    const getModsPath = () => {
        const state = context.api.getState();
        const udf = vortex_api_1.util.getSafe(state, ['settings', '7daystodie', 'udf'], undefined);
        return udf !== undefined ? path_1.default.join(udf, 'Mods') : 'Mods';
    };
    context.registerGame({
        id: common_1.GAME_ID,
        name: '7 Days to Die',
        mergeMods: (mod) => toLOPrefix(context, mod),
        queryPath: (0, util_1.toBlue)(findGame),
        supportedTools: [],
        queryModPath: getModsPath,
        logo: 'gameart.jpg',
        executable: common_1.gameExecutable,
        requiredFiles: [
            (0, common_1.gameExecutable)(),
        ],
        requiresLauncher,
        setup: (0, util_1.toBlue)((discovery) => prepareForModding(context, discovery)),
        environment: {
            SteamAPPId: STEAM_ID,
        },
        details: {
            steamAppId: +STEAM_ID,
            hashFiles: ['7DaysToDie_Data/Managed/Assembly-CSharp.dll'],
        },
    });
    context.registerLoadOrder({
        deserializeLoadOrder: () => (0, loadOrder_1.deserialize)(context),
        serializeLoadOrder: ((loadOrder, prev) => (0, loadOrder_1.serialize)(context, loadOrder, prev)),
        validate: loadOrder_1.validate,
        gameId: common_1.GAME_ID,
        toggleableEntries: false,
        usageInstructions: (() => {
            var _a;
            const state = context.api.getState();
            const profileId = (_a = vortex_api_1.selectors.activeProfile(state)) === null || _a === void 0 ? void 0 : _a.id;
            if (profileId === undefined) {
                return null;
            }
            return (React.createElement(InfoPanelWrap, { api: context.api, profileId: profileId }));
        }),
    });
    context.registerAction('fb-load-order-icons', 150, 'loot-sort', {}, 'Prefix Offset Assign', () => {
        setPrefixOffsetDialog(context.api);
    }, () => {
        const state = context.api.getState();
        const activeGame = vortex_api_1.selectors.activeGameId(state);
        return activeGame === common_1.GAME_ID;
    });
    context.registerAction('fb-load-order-icons', 150, 'loot-sort', {}, 'Prefix Offset Reset', () => {
        resetPrefixOffset(context.api);
    }, () => {
        const state = context.api.getState();
        const activeGame = vortex_api_1.selectors.activeGameId(state);
        return activeGame === common_1.GAME_ID;
    });
    const getOverhaulPath = (game) => {
        const state = context.api.getState();
        const discovery = vortex_api_1.selectors.discoveryByGame(state, common_1.GAME_ID);
        return discovery === null || discovery === void 0 ? void 0 : discovery.path;
    };
    context.registerInstaller('7dtd-mod', 25, (0, util_1.toBlue)(testSupportedContent), (0, util_1.toBlue)(installContent));
    context.registerInstaller('7dtd-root-mod', 20, (0, util_1.toBlue)(testRootMod), (0, util_1.toBlue)(installRootMod));
    context.registerModType('7dtd-root-mod', 20, (gameId) => gameId === common_1.GAME_ID, getOverhaulPath, (instructions) => {
        const candidateFound = hasCandidate(instructions
            .filter(instr => !!instr.destination)
            .map(instr => instr.destination));
        return Promise.resolve(candidateFound);
    }, { name: 'Root Directory Mod', mergeMods: true, deploymentEssential: false });
    context.registerMigration((0, util_1.toBlue)(old => (0, migrations_1.migrate020)(context.api, old)));
    context.registerMigration((0, util_1.toBlue)(old => (0, migrations_1.migrate100)(context, old)));
    context.registerMigration((0, util_1.toBlue)(old => (0, migrations_1.migrate1011)(context, old)));
    return true;
}
module.exports = {
    default: main,
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50c3giXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLGdEQUF3QjtBQUN4Qiw2Q0FBMEM7QUFDMUMsMkNBQWlFO0FBRWpFLDZDQUErQjtBQUUvQix1Q0FBb0Q7QUFDcEQseUNBQXFDO0FBRXJDLHFDQUFrSDtBQUNsSCwyQ0FBK0Q7QUFDL0QsNkNBQW1FO0FBRW5FLGlDQUErRjtBQUUvRixNQUFNLFFBQVEsR0FBRyxRQUFRLENBQUM7QUFDMUIsTUFBTSxTQUFTLEdBQUcsbUJBQW1CLENBQUM7QUFFdEMsTUFBTSxtQkFBbUIsR0FBRyxDQUFDLFNBQVMsQ0FBQyxDQUFDO0FBRXhDLFNBQVMsaUJBQWlCLENBQUMsR0FBd0I7O0lBQ2pELE1BQU0sS0FBSyxHQUFHLEdBQUcsQ0FBQyxRQUFRLEVBQUUsQ0FBQztJQUM3QixNQUFNLFNBQVMsR0FBRyxNQUFBLHNCQUFTLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQywwQ0FBRSxFQUFFLENBQUM7SUFDckQsSUFBSSxTQUFTLEtBQUssU0FBUyxFQUFFO1FBRTNCLEdBQUcsQ0FBQyxxQkFBcUIsQ0FBQyw0QkFBNEIsRUFBRSxTQUFTLEVBQUUsRUFBRSxXQUFXLEVBQUUsS0FBSyxFQUFFLENBQUMsQ0FBQztRQUMzRixPQUFPO0tBQ1I7SUFFRCxHQUFHLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxJQUFBLHlCQUFlLEVBQUMsU0FBUyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDbEQsTUFBTSxTQUFTLEdBQUcsaUJBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLFFBQVEsRUFBRSxFQUFFLENBQUMsWUFBWSxFQUFFLFdBQVcsRUFBRSxTQUFTLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQztJQUMzRixNQUFNLEtBQUssR0FBRyxTQUFTLENBQUMsR0FBRyxDQUFDLENBQUMsS0FB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QyxFQUNDLEVBQUUsSUFBSSxFQUFFLG9CQUFvQixFQUFFLFNBQVMsRUFBRSxJQUFJLEVBQUUsbUJBQW1CLEVBQUUsS0FBSyxFQUFFLENBQUMsQ0FBQztJQUVqRixPQUFPLENBQUMsaUJBQWlCLENBQUMsSUFBQSxhQUFNLEVBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxJQUFBLHVCQUFVLEVBQUMsT0FBTyxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDdkUsT0FBTyxDQUFDLGlCQUFpQixDQUFDLElBQUEsYUFBTSxFQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsSUFBQSx1QkFBVSxFQUFDLE9BQU8sRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDbkUsT0FBTyxDQUFDLGlCQUFpQixDQUFDLElBQUEsYUFBTSxFQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsSUFBQSx3QkFBVyxFQUFDLE9BQU8sRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFFcEUsT0FBTyxJQUFJLENBQUM7QUFDZCxDQUFDO0FBRUQsTUFBTSxDQUFDLE9BQU8sR0FBRztJQUNmLE9BQU8sRUFBRSxJQUFJO0NBQ2QsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBwYXRoIGZyb20gJ3BhdGgnO1xyXG5pbXBvcnQgeyB1c2VTZWxlY3RvciB9IGZyb20gJ3JlYWN0LXJlZHV4JztcclxuaW1wb3J0IHsgYWN0aW9ucywgZnMsIHNlbGVjdG9ycywgdHlwZXMsIHV0aWwgfSBmcm9tICd2b3J0ZXgtYXBpJztcclxuXHJcbmltcG9ydCAqIGFzIFJlYWN0IGZyb20gJ3JlYWN0JztcclxuXHJcbmltcG9ydCB7IHNldFByZWZpeE9mZnNldCwgc2V0VURGIH0gZnJvbSAnLi9hY3Rpb25zJztcclxuaW1wb3J0IHsgcmVkdWNlciB9IGZyb20gJy4vcmVkdWNlcnMnO1xyXG5cclxuaW1wb3J0IHsgR0FNRV9JRCwgZ2FtZUV4ZWN1dGFibGUsIE1PRF9JTkZPLCBsYXVuY2hlclNldHRpbmdzRmlsZVBhdGgsIERFRkFVTFRfTEFVTkNIRVJfU0VUVElOR1MgfSBmcm9tICcuL2NvbW1vbic7XHJcbmltcG9ydCB7IGRlc2VyaWFsaXplLCBzZXJpYWxpemUsIHZhbGlkYXRlIH0gZnJvbSAnLi9sb2FkT3JkZXInO1xyXG5pbXBvcnQgeyBtaWdyYXRlMDIwLCBtaWdyYXRlMTAwLCBtaWdyYXRlMTAxMSB9IGZyb20gJy4vbWlncmF0aW9ucyc7XHJcbmltcG9ydCB7IElMb2FkT3JkZXJFbnRyeSwgSVByb3BzIH0gZnJvbSAnLi90eXBlcyc7XHJcbmltcG9ydCB7IGVuc3VyZUxPRmlsZSwgZ2VuUHJvcHMsIGdldE1vZE5hbWUsIG1ha2VQcmVmaXgsIHJldmVyc2VQcmVmaXgsIHRvQmx1ZSB9IGZyb20gJy4vdXRpbCc7XHJcblxyXG5jb25zdCBTVEVBTV9JRCA9ICcyNTE1NzAnO1xyXG5jb25zdCBTVEVBTV9ETEwgPSAnc3RlYW1jbGllbnQ2NC5kbGwnO1xyXG5cclxuY29uc3QgUk9PVF9NT0RfQ0FORElEQVRFUyA9IFsnYmVwaW5leCddO1xyXG5cclxuZnVuY3Rpb24gcmVzZXRQcmVmaXhPZmZzZXQoYXBpOiB0eXBlcy5JRXh0ZW5zaW9uQXBpKSB7XHJcbiAgY29uc3Qgc3RhdGUgPSBhcGkuZ2V0U3RhdGUoKTtcclxuICBjb25zdCBwcm9maWxlSWQgPSBzZWxlY3RvcnMuYWN0aXZlUHJvZmlsZShzdGF0ZSk/LmlkO1xyXG4gIGlmIChwcm9maWxlSWQgPT09IHVuZGVmaW5lZCkge1xyXG4gICAgLy8gSG93ID9cclxuICAgIGFwaS5zaG93RXJyb3JOb3RpZmljYXRpb24oJ05vIGFjdGl2ZSBwcm9maWxlIGZvciA3ZHRkJywgdW5kZWZpbmVkLCB7IGFsbG93UmVwb3J0OiBmYWxzZSB9KTtcclxuICAgIHJldHVybjtcclxuICB9XHJcblxyXG4gIGFwaS5zdG9yZS5kaXNwYXRjaChzZXRQcmVmaXhPZmZzZXQocHJvZmlsZUlkLCAwKSk7XHJcbiAgY29uc3QgbG9hZE9yZGVyID0gdXRpbC5nZXRTYWZlKGFwaS5nZXRTdGF0ZSgpLCBbJ3BlcnNpc3RlbnQnLCAnbG9hZE9yZGVyJywgcHJvZmlsZUlkXSwgW10pO1xyXG4gIGNvbnN0IG5ld0xPID0gbG9hZE9yZGVyLm1hcCgoZW50cnksIGlkeCkgPT4gKHtcclxuICAgIC4uLmVudHJ5LFxyXG4gICAgZGF0YToge1xyXG4gICAgICBwcmVmaXg6IG1ha2VQcmVmaXgoaWR4KSxcclxuICAgIH0sXHJcbiAgfSkpO1xyXG4gIGFwaS5zdG9yZS5kaXNwYXRjaChhY3Rpb25zLnNldExvYWRPcmRlcihwcm9maWxlSWQsIG5ld0xPKSk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIHNldFByZWZpeE9mZnNldERpYWxvZyhhcGk6IHR5cGVzLklFeHRlbnNpb25BcGkpIHtcclxuICByZXR1cm4gYXBpLnNob3dEaWFsb2coJ3F1ZXN0aW9uJywgJ1NldCBOZXcgUHJlZml4IE9mZnNldCcsIHtcclxuICAgIHRleHQ6IGFwaS50cmFuc2xhdGUoJ0luc2VydCBuZXcgcHJlZml4IG9mZnNldCBmb3IgbW9kbGV0cyAoQUFBLVpaWik6JyksXHJcbiAgICBpbnB1dDogW1xyXG4gICAgICB7XHJcbiAgICAgICAgaWQ6ICc3ZHRkcHJlZml4b2Zmc2V0aW5wdXQnLFxyXG4gICAgICAgIGxhYmVsOiAnUHJlZml4IE9mZnNldCcsXHJcbiAgICAgICAgdHlwZTogJ3RleHQnLFxyXG4gICAgICAgIHBsYWNlaG9sZGVyOiAnQUFBJyxcclxuICAgICAgfV0sXHJcbiAgfSwgWyB7IGxhYmVsOiAnQ2FuY2VsJyB9LCB7IGxhYmVsOiAnU2V0JywgZGVmYXVsdDogdHJ1ZSB9IF0pXHJcbiAgLnRoZW4ocmVzdWx0ID0+IHtcclxuICAgIGlmIChyZXN1bHQuYWN0aW9uID09PSAnU2V0Jykge1xyXG4gICAgICBjb25zdCBwcmVmaXggPSByZXN1bHQuaW5wdXRbJzdkdGRwcmVmaXhvZmZzZXRpbnB1dCddO1xyXG4gICAgICBsZXQgb2Zmc2V0ID0gMDtcclxuICAgICAgdHJ5IHtcclxuICAgICAgICBvZmZzZXQgPSByZXZlcnNlUHJlZml4KHByZWZpeCk7XHJcbiAgICAgIH0gY2F0Y2ggKGVycikge1xyXG4gICAgICAgIHJldHVybiBQcm9taXNlLnJlamVjdChlcnIpO1xyXG4gICAgICB9XHJcbiAgICAgIGNvbnN0IHN0YXRlID0gYXBpLmdldFN0YXRlKCk7XHJcbiAgICAgIGNvbnN0IHByb2ZpbGVJZCA9IHNlbGVjdG9ycy5hY3RpdmVQcm9maWxlKHN0YXRlKT8uaWQ7XHJcbiAgICAgIGlmIChwcm9maWxlSWQgPT09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgIC8vIEhvdyA/XHJcbiAgICAgICAgYXBpLnNob3dFcnJvck5vdGlmaWNhdGlvbignTm8gYWN0aXZlIHByb2ZpbGUgZm9yIDdkdGQnLCB1bmRlZmluZWQsIHsgYWxsb3dSZXBvcnQ6IGZhbHNlIH0pO1xyXG4gICAgICAgIHJldHVybjtcclxuICAgICAgfVxyXG5cclxuICAgICAgYXBpLnN0b3JlLmRpc3BhdGNoKHNldFByZWZpeE9mZnNldChwcm9maWxlSWQsIG9mZnNldCkpO1xyXG4gICAgICBjb25zdCBsb2FkT3JkZXIgPSB1dGlsLmdldFNhZmUoYXBpLmdldFN0YXRlKCksIFsncGVyc2lzdGVudCcsICdsb2FkT3JkZXInLCBwcm9maWxlSWRdLCBbXSk7XHJcbiAgICAgIGNvbnN0IG5ld0xPID0gbG9hZE9yZGVyLm1hcChlbnRyeSA9PiAoe1xyXG4gICAgICAgIC4uLmVudHJ5LFxyXG4gICAgICAgIGRhdGE6IHtcclxuICAgICAgICAgIHByZWZpeDogbWFrZVByZWZpeChyZXZlcnNlUHJlZml4KGVudHJ5LmRhdGEucHJlZml4KSArIG9mZnNldCksXHJcbiAgICAgICAgfSxcclxuICAgICAgfSkpO1xyXG4gICAgICBhcGkuc3RvcmUuZGlzcGF0Y2goYWN0aW9ucy5zZXRMb2FkT3JkZXIocHJvZmlsZUlkLCBuZXdMTykpO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgpO1xyXG4gIH0pXHJcbiAgLmNhdGNoKGVyciA9PiB7XHJcbiAgICBhcGkuc2hvd0Vycm9yTm90aWZpY2F0aW9uKCdGYWlsZWQgdG8gc2V0IHByZWZpeCBvZmZzZXQnLCBlcnIsIHsgYWxsb3dSZXBvcnQ6IGZhbHNlIH0pO1xyXG4gICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgpO1xyXG4gIH0pO1xyXG59XHJcblxyXG5hc3luYyBmdW5jdGlvbiBmaW5kR2FtZSgpIHtcclxuICByZXR1cm4gdXRpbC5HYW1lU3RvcmVIZWxwZXIuZmluZEJ5QXBwSWQoW1NURUFNX0lEXSlcclxuICAgIC50aGVuKGdhbWUgPT4gZ2FtZS5nYW1lUGF0aCk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIHBhcnNlQWRkaXRpb25hbFBhcmFtZXRlcnMocGFyYW1ldGVyczogc3RyaW5nKSB7XHJcbiAgY29uc3QgdWRmUGFyYW0gPSBwYXJhbWV0ZXJzLnNwbGl0KCctJykuZmluZChwYXJhbSA9PiBwYXJhbS5zdGFydHNXaXRoKCdVc2VyRGF0YUZvbGRlcj0nKSk7XHJcbiAgY29uc3QgdWRmID0gdWRmUGFyYW0gPyB1ZGZQYXJhbS5zcGxpdCgnPScpPy5bMV0/LnRyaW1FbmQoKSA6IHVuZGVmaW5lZDtcclxuICByZXR1cm4gKHVkZiAmJiBwYXRoLmlzQWJzb2x1dGUodWRmKSkgPyB1ZGYgOiB1bmRlZmluZWQ7XHJcbn1cclxuXHJcbmFzeW5jIGZ1bmN0aW9uIHByZXBhcmVGb3JNb2RkaW5nKGNvbnRleHQ6IHR5cGVzLklFeHRlbnNpb25Db250ZXh0LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkaXNjb3Zlcnk6IHR5cGVzLklEaXNjb3ZlcnlSZXN1bHQpIHtcclxuICBjb25zdCByZXF1aXJlc1Jlc3RhcnQgPSB1dGlsLmdldFNhZmUoY29udGV4dC5hcGkuZ2V0U3RhdGUoKSxcclxuICAgIFsnc2V0dGluZ3MnLCAnN2RheXN0b2RpZScsICd1ZGYnXSwgdW5kZWZpbmVkKSA9PT0gdW5kZWZpbmVkO1xyXG4gIGNvbnN0IGxhdW5jaGVyU2V0dGluZ3MgPSBsYXVuY2hlclNldHRpbmdzRmlsZVBhdGgoKTtcclxuICBjb25zdCByZWxhdW5jaEV4dCA9ICgpID0+IHtcclxuICAgIHJldHVybiBjb250ZXh0LmFwaS5zaG93RGlhbG9nKCdpbmZvJywgJ1Jlc3RhcnQgUmVxdWlyZWQnLCB7XHJcbiAgICAgIHRleHQ6ICdUaGUgZXh0ZW5zaW9uIHJlcXVpcmVzIGEgcmVzdGFydCB0byBjb21wbGV0ZSB0aGUgVURGIHNldHVwLiAnXHJcbiAgICAgICAgICArICdUaGUgZXh0ZW5zaW9uIHdpbGwgbm93IGV4aXQgLSBwbGVhc2UgcmUtYWN0aXZhdGUgaXQgdmlhIHRoZSBnYW1lcyBwYWdlIG9yIGRhc2hib2FyZC4nLFxyXG4gICAgfSwgWyB7IGxhYmVsOiAnUmVzdGFydCBFeHRlbnNpb24nIH0gXSlcclxuICAgIC50aGVuKCgpID0+IHtcclxuICAgICAgcmV0dXJuIFByb21pc2UucmVqZWN0KG5ldyB1dGlsLlByb2Nlc3NDYW5jZWxlZCgnUmVzdGFydCByZXF1aXJlZCcpKTtcclxuICAgIH0pO1xyXG4gIH1cclxuICBjb25zdCBzZWxlY3RVREYgPSBhc3luYyAoKSA9PiB7XHJcbiAgICBjb25zdCByZXMgPSBhd2FpdCBjb250ZXh0LmFwaS5zaG93RGlhbG9nKCdpbmZvJywgJ0Nob29zZSBVc2VyIERlZmluZWQgRm9sZGVyJywge1xyXG4gICAgICB0ZXh0OiAnVGhlIG1vZGRpbmcgcGF0dGVybiBmb3IgN0RURCBpcyBjaGFuZ2luZy4gVGhlIE1vZHMgcGF0aCBpbnNpZGUgdGhlIGdhbWUgZGlyZWN0b3J5ICdcclxuICAgICAgICAgICsgJ2lzIGJlaW5nIGRlcHJlY2F0ZWQgYW5kIG1vZHMgbG9jYXRlZCBpbiB0aGUgb2xkIHBhdGggd2lsbCBubyBsb25nZXIgd29yayBpbiB0aGUgbmVhciAnXHJcbiAgICAgICAgICArICdmdXR1cmUuIFBsZWFzZSBzZWxlY3QgeW91ciBVc2VyIERlZmluZWQgRm9sZGVyIChVREYpIC0gVm9ydGV4IHdpbGwgZGVwbG95IHRvIHRoaXMgbmV3IGxvY2F0aW9uLicsXHJcbiAgICB9LFxyXG4gICAgW1xyXG4gICAgICB7IGxhYmVsOiAnQ2FuY2VsJyB9LFxyXG4gICAgICB7IGxhYmVsOiAnU2VsZWN0IFVERicgfSxcclxuICAgIF0pO1xyXG4gICAgaWYgKHJlcy5hY3Rpb24gIT09ICdTZWxlY3QgVURGJykge1xyXG4gICAgICByZXR1cm4gUHJvbWlzZS5yZWplY3QobmV3IHV0aWwuUHJvY2Vzc0NhbmNlbGVkKCdDYW5ub3QgcHJvY2VlZCB3aXRob3V0IFVGRCcpKTtcclxuICAgIH1cclxuICAgIGF3YWl0IGZzLmVuc3VyZURpcldyaXRhYmxlQXN5bmMocGF0aC5kaXJuYW1lKGxhdW5jaGVyU2V0dGluZ3MpKTtcclxuICAgIGF3YWl0IGVuc3VyZUxPRmlsZShjb250ZXh0KTtcclxuICAgIGNvbnN0IGRpcmVjdG9yeSA9IGF3YWl0IGNvbnRleHQuYXBpLnNlbGVjdERpcih7XHJcbiAgICAgIHRpdGxlOiAnU2VsZWN0IFVzZXIgRGF0YSBGb2xkZXInLFxyXG4gICAgICBkZWZhdWx0UGF0aDogcGF0aC5qb2luKHBhdGguZGlybmFtZShsYXVuY2hlclNldHRpbmdzKSksXHJcbiAgICB9KTtcclxuICAgIGlmICghZGlyZWN0b3J5KSB7XHJcbiAgICAgIHJldHVybiBQcm9taXNlLnJlamVjdChuZXcgdXRpbC5Qcm9jZXNzQ2FuY2VsZWQoJ0Nhbm5vdCBwcm9jZWVkIHdpdGhvdXQgVUZEJykpO1xyXG4gICAgfVxyXG4gICAgYXdhaXQgZnMuZW5zdXJlRGlyV3JpdGFibGVBc3luYyhwYXRoLmpvaW4oZGlyZWN0b3J5LCAnTW9kcycpKTtcclxuICAgIGNvbnN0IGxhdW5jaGVyID0gREVGQVVMVF9MQVVOQ0hFUl9TRVRUSU5HUztcclxuICAgIGxhdW5jaGVyLkRlZmF1bHRSdW5Db25maWcuQWRkaXRpb25hbFBhcmFtZXRlcnMgPSBgLVVzZXJEYXRhRm9sZGVyPSR7ZGlyZWN0b3J5fWA7XHJcbiAgICBjb25zdCBsYXVuY2hlckRhdGEgPSBKU09OLnN0cmluZ2lmeShsYXVuY2hlciwgbnVsbCwgMik7XHJcbiAgICBhd2FpdCBmcy53cml0ZUZpbGVBc3luYyhsYXVuY2hlclNldHRpbmdzLCBsYXVuY2hlckRhdGEsIHsgZW5jb2Rpbmc6ICd1dGY4JyB9KTtcclxuICAgIGNvbnRleHQuYXBpLnN0b3JlLmRpc3BhdGNoKHNldFVERihkaXJlY3RvcnkpKTtcclxuICAgIHJldHVybiAocmVxdWlyZXNSZXN0YXJ0KSA/IHJlbGF1bmNoRXh0KCkgOiBQcm9taXNlLnJlc29sdmUoKTtcclxuICB9O1xyXG5cclxuICB0cnkge1xyXG4gICAgY29uc3QgZGF0YSA9IGF3YWl0IGZzLnJlYWRGaWxlQXN5bmMobGF1bmNoZXJTZXR0aW5ncywgeyBlbmNvZGluZzogJ3V0ZjgnIH0pO1xyXG4gICAgY29uc3Qgc2V0dGluZ3MgPSBKU09OLnBhcnNlKGRhdGEpO1xyXG4gICAgaWYgKHNldHRpbmdzPy5EZWZhdWx0UnVuQ29uZmlnPy5BZGRpdGlvbmFsUGFyYW1ldGVycyAhPT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgIGNvbnN0IHVkZiA9IHBhcnNlQWRkaXRpb25hbFBhcmFtZXRlcnMoc2V0dGluZ3MuRGVmYXVsdFJ1bkNvbmZpZy5BZGRpdGlvbmFsUGFyYW1ldGVycyk7XHJcbiAgICAgIGlmICghIXVkZikge1xyXG4gICAgICAgIGF3YWl0IGZzLmVuc3VyZURpcldyaXRhYmxlQXN5bmMocGF0aC5qb2luKHVkZiwgJ01vZHMnKSk7XHJcbiAgICAgICAgYXdhaXQgZW5zdXJlTE9GaWxlKGNvbnRleHQpO1xyXG4gICAgICAgIGNvbnRleHQuYXBpLnN0b3JlLmRpc3BhdGNoKHNldFVERih1ZGYpKTtcclxuICAgICAgICByZXR1cm4gKHJlcXVpcmVzUmVzdGFydCkgPyByZWxhdW5jaEV4dCgpIDogUHJvbWlzZS5yZXNvbHZlKCk7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgcmV0dXJuIHNlbGVjdFVERigpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfSBjYXRjaCAoZXJyKSB7XHJcbiAgICByZXR1cm4gc2VsZWN0VURGKCk7XHJcbiAgfVxyXG59XHJcblxyXG5hc3luYyBmdW5jdGlvbiBpbnN0YWxsQ29udGVudChmaWxlczogc3RyaW5nW10sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlc3RpbmF0aW9uUGF0aDogc3RyaW5nLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBnYW1lSWQ6IHN0cmluZyk6IFByb21pc2U8dHlwZXMuSUluc3RhbGxSZXN1bHQ+IHtcclxuICAvLyBUaGUgbW9kaW5mby54bWwgZmlsZSBpcyBleHBlY3RlZCB0byBhbHdheXMgYmUgcG9zaXRpb25lZCBpbiB0aGUgcm9vdCBkaXJlY3RvcnlcclxuICAvLyAgb2YgdGhlIG1vZCBpdHNlbGY7IHdlJ3JlIGdvaW5nIHRvIGRpc3JlZ2FyZCBhbnl0aGluZyBwbGFjZWQgb3V0c2lkZSB0aGUgcm9vdC5cclxuICBjb25zdCBtb2RGaWxlID0gZmlsZXMuZmluZChmaWxlID0+IHBhdGguYmFzZW5hbWUoZmlsZSkudG9Mb3dlckNhc2UoKSA9PT0gTU9EX0lORk8pO1xyXG4gIGNvbnN0IHJvb3RQYXRoID0gcGF0aC5kaXJuYW1lKG1vZEZpbGUpO1xyXG4gIHJldHVybiBnZXRNb2ROYW1lKHBhdGguam9pbihkZXN0aW5hdGlvblBhdGgsIG1vZEZpbGUpKVxyXG4gICAgLnRoZW4obW9kTmFtZSA9PiB7XHJcbiAgICAgIG1vZE5hbWUgPSBtb2ROYW1lLnJlcGxhY2UoL1teYS16QS1aMC05XS9nLCAnJyk7XHJcblxyXG4gICAgICAvLyBSZW1vdmUgZGlyZWN0b3JpZXMgYW5kIGFueXRoaW5nIHRoYXQgaXNuJ3QgaW4gdGhlIHJvb3RQYXRoIChhbHNvIGRpcmVjdG9yaWVzKS5cclxuICAgICAgY29uc3QgZmlsdGVyZWQgPSBmaWxlcy5maWx0ZXIoZmlsZVBhdGggPT5cclxuICAgICAgICBmaWxlUGF0aC5zdGFydHNXaXRoKHJvb3RQYXRoKSAmJiAhZmlsZVBhdGguZW5kc1dpdGgocGF0aC5zZXApKTtcclxuXHJcbiAgICAgIGNvbnN0IGluc3RydWN0aW9uczogdHlwZXMuSUluc3RydWN0aW9uW10gPSBmaWx0ZXJlZC5tYXAoZmlsZVBhdGggPT4ge1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICB0eXBlOiAnY29weScsXHJcbiAgICAgICAgICBzb3VyY2U6IGZpbGVQYXRoLFxyXG4gICAgICAgICAgZGVzdGluYXRpb246IHBhdGgucmVsYXRpdmUocm9vdFBhdGgsIGZpbGVQYXRoKSxcclxuICAgICAgICB9O1xyXG4gICAgICB9KTtcclxuXHJcbiAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoeyBpbnN0cnVjdGlvbnMgfSk7XHJcbiAgICB9KTtcclxufVxyXG5cclxuZnVuY3Rpb24gdGVzdFN1cHBvcnRlZENvbnRlbnQoZmlsZXMsIGdhbWVJZCkge1xyXG4gIC8vIE1ha2Ugc3VyZSB3ZSdyZSBhYmxlIHRvIHN1cHBvcnQgdGhpcyBtb2QuXHJcbiAgY29uc3Qgc3VwcG9ydGVkID0gKGdhbWVJZCA9PT0gR0FNRV9JRCkgJiZcclxuICAgIChmaWxlcy5maW5kKGZpbGUgPT4gcGF0aC5iYXNlbmFtZShmaWxlKS50b0xvd2VyQ2FzZSgpID09PSBNT0RfSU5GTykgIT09IHVuZGVmaW5lZCk7XHJcbiAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSh7XHJcbiAgICBzdXBwb3J0ZWQsXHJcbiAgICByZXF1aXJlZEZpbGVzOiBbXSxcclxuICB9KTtcclxufVxyXG5cclxuZnVuY3Rpb24gZmluZENhbmRGaWxlKGZpbGVzOiBzdHJpbmdbXSk6IHN0cmluZyB7XHJcbiAgcmV0dXJuIGZpbGVzLmZpbmQoZmlsZSA9PiBmaWxlLnRvTG93ZXJDYXNlKCkuc3BsaXQocGF0aC5zZXApXHJcbiAgICAuZmluZChzZWcgPT4gUk9PVF9NT0RfQ0FORElEQVRFUy5pbmNsdWRlcyhzZWcpKSAhPT0gdW5kZWZpbmVkKTtcclxufVxyXG5cclxuZnVuY3Rpb24gaGFzQ2FuZGlkYXRlKGZpbGVzOiBzdHJpbmdbXSk6IGJvb2xlYW4ge1xyXG4gIGNvbnN0IGNhbmRpZGF0ZSA9IGZpbmRDYW5kRmlsZShmaWxlcyk7XHJcbiAgcmV0dXJuIGNhbmRpZGF0ZSAhPT0gdW5kZWZpbmVkO1xyXG59XHJcblxyXG5hc3luYyBmdW5jdGlvbiBpbnN0YWxsUm9vdE1vZChmaWxlczogc3RyaW5nW10sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGdhbWVJZDogc3RyaW5nKTogUHJvbWlzZTx0eXBlcy5JSW5zdGFsbFJlc3VsdD4ge1xyXG4gIGNvbnN0IGZpbHRlcmVkID0gZmlsZXMuZmlsdGVyKGZpbGUgPT4gIWZpbGUuZW5kc1dpdGgocGF0aC5zZXApKTtcclxuICBjb25zdCBjYW5kaWRhdGUgPSBmaW5kQ2FuZEZpbGUoZmlsZXMpO1xyXG4gIGNvbnN0IGNhbmRJZHggPSBjYW5kaWRhdGUudG9Mb3dlckNhc2UoKS5zcGxpdChwYXRoLnNlcClcclxuICAgIC5maW5kSW5kZXgoc2VnID0+IFJPT1RfTU9EX0NBTkRJREFURVMuaW5jbHVkZXMoc2VnKSk7XHJcbiAgY29uc3QgaW5zdHJ1Y3Rpb25zOiB0eXBlcy5JSW5zdHJ1Y3Rpb25bXSA9IGZpbHRlcmVkLnJlZHVjZSgoYWNjdW0sIGl0ZXIpID0+IHtcclxuICAgIGFjY3VtLnB1c2goe1xyXG4gICAgICB0eXBlOiAnY29weScsXHJcbiAgICAgIHNvdXJjZTogaXRlcixcclxuICAgICAgZGVzdGluYXRpb246IGl0ZXIuc3BsaXQocGF0aC5zZXApLnNsaWNlKGNhbmRJZHgpLmpvaW4ocGF0aC5zZXApLFxyXG4gICAgfSk7XHJcbiAgICByZXR1cm4gYWNjdW07XHJcbiAgfSwgW10pO1xyXG4gIHJldHVybiBQcm9taXNlLnJlc29sdmUoeyBpbnN0cnVjdGlvbnMgfSk7XHJcbn1cclxuXHJcbmFzeW5jIGZ1bmN0aW9uIHRlc3RSb290TW9kKGZpbGVzOiBzdHJpbmdbXSwgZ2FtZUlkOiBzdHJpbmcpOiBQcm9taXNlPHR5cGVzLklTdXBwb3J0ZWRSZXN1bHQ+IHtcclxuICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHtcclxuICAgIHJlcXVpcmVkRmlsZXM6IFtdLFxyXG4gICAgc3VwcG9ydGVkOiBoYXNDYW5kaWRhdGUoZmlsZXMpICYmIGdhbWVJZCA9PT0gR0FNRV9JRCxcclxuICB9KTtcclxufVxyXG5cclxuZnVuY3Rpb24gdG9MT1ByZWZpeChjb250ZXh0OiB0eXBlcy5JRXh0ZW5zaW9uQ29udGV4dCwgbW9kOiB0eXBlcy5JTW9kKTogc3RyaW5nIHtcclxuICBjb25zdCBwcm9wczogSVByb3BzID0gZ2VuUHJvcHMoY29udGV4dCk7XHJcbiAgaWYgKHByb3BzID09PSB1bmRlZmluZWQpIHtcclxuICAgIHJldHVybiAnWlpaWi0nICsgbW9kLmlkO1xyXG4gIH1cclxuXHJcbiAgLy8gUmV0cmlldmUgdGhlIGxvYWQgb3JkZXIgYXMgc3RvcmVkIGluIFZvcnRleCdzIGFwcGxpY2F0aW9uIHN0YXRlLlxyXG4gIGNvbnN0IGxvYWRPcmRlciA9IHV0aWwuZ2V0U2FmZShwcm9wcy5zdGF0ZSwgWydwZXJzaXN0ZW50JywgJ2xvYWRPcmRlcicsIHByb3BzLnByb2ZpbGUuaWRdLCBbXSk7XHJcblxyXG4gIC8vIEZpbmQgdGhlIG1vZCBlbnRyeSBpbiB0aGUgbG9hZCBvcmRlciBzdGF0ZSBhbmQgaW5zZXJ0IHRoZSBwcmVmaXggaW4gZnJvbnRcclxuICAvLyAgb2YgdGhlIG1vZCdzIG5hbWUvaWQvd2hhdGV2ZXJcclxuICBsZXQgbG9FbnRyeTogSUxvYWRPcmRlckVudHJ5ID0gbG9hZE9yZGVyLmZpbmQobG9FbnRyeSA9PiBsb0VudHJ5LmlkID09PSBtb2QuaWQpO1xyXG4gIGlmIChsb0VudHJ5ID09PSB1bmRlZmluZWQpIHtcclxuICAgIC8vIFRoZSBtb2QgZW50cnkgd2Fzbid0IGZvdW5kIGluIHRoZSBsb2FkIG9yZGVyIHN0YXRlIC0gdGhpcyBpcyBwb3RlbnRpYWxseVxyXG4gICAgLy8gIGR1ZSB0byB0aGUgbW9kIGJlaW5nIHJlbW92ZWQgYXMgcGFydCBvZiBhbiB1cGRhdGUgb3IgdW5pbnN0YWxsYXRpb24uXHJcbiAgICAvLyAgSXQncyBpbXBvcnRhbnQgd2UgZmluZCB0aGUgcHJlZml4IG9mIHRoZSBtb2QgaW4gdGhpcyBjYXNlLCBhcyB0aGUgZGVwbG95bWVudFxyXG4gICAgLy8gIG1ldGhvZCBjb3VsZCBwb3RlbnRpYWxseSBmYWlsIHRvIHJlbW92ZSB0aGUgbW9kISBXZSdyZSBnb2luZyB0byBjaGVja1xyXG4gICAgLy8gIHRoZSBwcmV2aW91cyBsb2FkIG9yZGVyIHNhdmVkIGZvciB0aGlzIHByb2ZpbGUgYW5kIHVzZSB0aGF0IGlmIGl0IGV4aXN0cy5cclxuICAgIGNvbnN0IHByZXYgPSB1dGlsLmdldFNhZmUocHJvcHMuc3RhdGUsIFsnc2V0dGluZ3MnLCAnN2RheXN0b2RpZScsICdwcmV2aW91c0xPJywgcHJvcHMucHJvZmlsZS5pZF0sIFtdKTtcclxuICAgIGxvRW50cnkgPSBwcmV2LmZpbmQobG9FbnRyeSA9PiBsb0VudHJ5LmlkID09PSBtb2QuaWQpO1xyXG4gIH1cclxuXHJcbiAgcmV0dXJuIChsb0VudHJ5Py5kYXRhPy5wcmVmaXggIT09IHVuZGVmaW5lZClcclxuICAgID8gbG9FbnRyeS5kYXRhLnByZWZpeCArICctJyArIG1vZC5pZFxyXG4gICAgOiAnWlpaWi0nICsgbW9kLmlkO1xyXG59XHJcblxyXG5mdW5jdGlvbiByZXF1aXJlc0xhdW5jaGVyKGdhbWVQYXRoKSB7XHJcbiAgcmV0dXJuIGZzLnJlYWRkaXJBc3luYyhnYW1lUGF0aClcclxuICAgIC50aGVuKGZpbGVzID0+IChmaWxlcy5maW5kKGZpbGUgPT4gZmlsZS5lbmRzV2l0aChTVEVBTV9ETEwpKSAhPT0gdW5kZWZpbmVkKVxyXG4gICAgICA/IFByb21pc2UucmVzb2x2ZSh7IGxhdW5jaGVyOiAnc3RlYW0nIH0pXHJcbiAgICAgIDogUHJvbWlzZS5yZXNvbHZlKHVuZGVmaW5lZCkpXHJcbiAgICAuY2F0Y2goZXJyID0+IFByb21pc2UucmVqZWN0KGVycikpO1xyXG59XHJcblxyXG5mdW5jdGlvbiBJbmZvUGFuZWwocHJvcHMpIHtcclxuICBjb25zdCB7IHQsIGN1cnJlbnRPZmZzZXQgfSA9IHByb3BzO1xyXG5cclxuICByZXR1cm4gKFxyXG4gICAgPGRpdiBzdHlsZT17eyBkaXNwbGF5OiAnZmxleCcsIGZsZXhEaXJlY3Rpb246ICdjb2x1bW4nLCBwYWRkaW5nOiAnMTZweCcgfX0+XHJcbiAgICAgIDxkaXYgc3R5bGU9e3sgZGlzcGxheTogJ2ZsZXgnLCB3aGl0ZVNwYWNlOiAnbm93cmFwJywgYWxpZ25JdGVtczogJ2NlbnRlcicgfX0+XHJcbiAgICAgICAge3QoJ0N1cnJlbnQgUHJlZml4IE9mZnNldDogJyl9XHJcbiAgICAgICAgPGhyLz5cclxuICAgICAgICA8bGFiZWwgc3R5bGU9e3sgY29sb3I6ICdyZWQnIH19PntjdXJyZW50T2Zmc2V0fTwvbGFiZWw+XHJcbiAgICAgIDwvZGl2PlxyXG4gICAgICA8aHIvPlxyXG4gICAgICA8ZGl2PlxyXG4gICAgICAgIHt0KCc3IERheXMgdG8gRGllIGxvYWRzIG1vZHMgaW4gYWxwaGFiZXRpYyBvcmRlciBzbyBWb3J0ZXggcHJlZml4ZXMgJ1xyXG4gICAgICAgICArICd0aGUgZGlyZWN0b3J5IG5hbWVzIHdpdGggXCJBQUEsIEFBQiwgQUFDLCAuLi5cIiB0byBlbnN1cmUgdGhleSBsb2FkIGluIHRoZSBvcmRlciB5b3Ugc2V0IGhlcmUuJyl9XHJcbiAgICAgIDwvZGl2PlxyXG4gICAgPC9kaXY+XHJcbiAgKTtcclxufVxyXG5cclxuZnVuY3Rpb24gSW5mb1BhbmVsV3JhcChwcm9wczogeyBhcGk6IHR5cGVzLklFeHRlbnNpb25BcGksIHByb2ZpbGVJZDogc3RyaW5nIH0pIHtcclxuICBjb25zdCB7IGFwaSwgcHJvZmlsZUlkIH0gPSBwcm9wcztcclxuICBjb25zdCBjdXJyZW50T2Zmc2V0ID0gdXNlU2VsZWN0b3IoKHN0YXRlOiB0eXBlcy5JU3RhdGUpID0+XHJcbiAgICBtYWtlUHJlZml4KHV0aWwuZ2V0U2FmZShzdGF0ZSxcclxuICAgICAgWydzZXR0aW5ncycsICc3ZGF5c3RvZGllJywgJ3ByZWZpeE9mZnNldCcsIHByb2ZpbGVJZF0sIDApKSk7XHJcblxyXG4gIHJldHVybiAoXHJcbiAgICA8SW5mb1BhbmVsXHJcbiAgICAgIHQ9e2FwaS50cmFuc2xhdGV9XHJcbiAgICAgIGN1cnJlbnRPZmZzZXQ9e2N1cnJlbnRPZmZzZXR9XHJcbiAgICAvPlxyXG4gICk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIG1haW4oY29udGV4dDogdHlwZXMuSUV4dGVuc2lvbkNvbnRleHQpIHtcclxuICBjb250ZXh0LnJlZ2lzdGVyUmVkdWNlcihbJ3NldHRpbmdzJywgJzdkYXlzdG9kaWUnXSwgcmVkdWNlcik7XHJcblxyXG4gIGNvbnN0IGdldE1vZHNQYXRoID0gKCkgPT4ge1xyXG4gICAgY29uc3Qgc3RhdGUgPSBjb250ZXh0LmFwaS5nZXRTdGF0ZSgpO1xyXG4gICAgY29uc3QgdWRmID0gdXRpbC5nZXRTYWZlKHN0YXRlLCBbJ3NldHRpbmdzJywgJzdkYXlzdG9kaWUnLCAndWRmJ10sIHVuZGVmaW5lZCk7XHJcbiAgICByZXR1cm4gdWRmICE9PSB1bmRlZmluZWQgPyBwYXRoLmpvaW4odWRmLCAnTW9kcycpIDogJ01vZHMnO1xyXG4gIH1cclxuXHJcbiAgY29udGV4dC5yZWdpc3RlckdhbWUoe1xyXG4gICAgaWQ6IEdBTUVfSUQsXHJcbiAgICBuYW1lOiAnNyBEYXlzIHRvIERpZScsXHJcbiAgICBtZXJnZU1vZHM6IChtb2QpID0+IHRvTE9QcmVmaXgoY29udGV4dCwgbW9kKSxcclxuICAgIHF1ZXJ5UGF0aDogdG9CbHVlKGZpbmRHYW1lKSxcclxuICAgIHN1cHBvcnRlZFRvb2xzOiBbXSxcclxuICAgIHF1ZXJ5TW9kUGF0aDogZ2V0TW9kc1BhdGgsXHJcbiAgICBsb2dvOiAnZ2FtZWFydC5qcGcnLFxyXG4gICAgZXhlY3V0YWJsZTogZ2FtZUV4ZWN1dGFibGUsXHJcbiAgICByZXF1aXJlZEZpbGVzOiBbXHJcbiAgICAgIGdhbWVFeGVjdXRhYmxlKCksXHJcbiAgICBdLFxyXG4gICAgcmVxdWlyZXNMYXVuY2hlcixcclxuICAgIHNldHVwOiB0b0JsdWUoKGRpc2NvdmVyeSkgPT4gcHJlcGFyZUZvck1vZGRpbmcoY29udGV4dCwgZGlzY292ZXJ5KSksXHJcbiAgICBlbnZpcm9ubWVudDoge1xyXG4gICAgICBTdGVhbUFQUElkOiBTVEVBTV9JRCxcclxuICAgIH0sXHJcbiAgICBkZXRhaWxzOiB7XHJcbiAgICAgIHN0ZWFtQXBwSWQ6ICtTVEVBTV9JRCxcclxuICAgICAgaGFzaEZpbGVzOiBbJzdEYXlzVG9EaWVfRGF0YS9NYW5hZ2VkL0Fzc2VtYmx5LUNTaGFycC5kbGwnXSxcclxuICAgIH0sXHJcbiAgfSk7XHJcblxyXG4gIGNvbnRleHQucmVnaXN0ZXJMb2FkT3JkZXIoe1xyXG4gICAgZGVzZXJpYWxpemVMb2FkT3JkZXI6ICgpID0+IGRlc2VyaWFsaXplKGNvbnRleHQpLFxyXG4gICAgc2VyaWFsaXplTG9hZE9yZGVyOiAoKGxvYWRPcmRlciwgcHJldikgPT4gc2VyaWFsaXplKGNvbnRleHQsIGxvYWRPcmRlciwgcHJldikpIGFzIGFueSxcclxuICAgIHZhbGlkYXRlLFxyXG4gICAgZ2FtZUlkOiBHQU1FX0lELFxyXG4gICAgdG9nZ2xlYWJsZUVudHJpZXM6IGZhbHNlLFxyXG4gICAgdXNhZ2VJbnN0cnVjdGlvbnM6ICgoKSA9PiB7XHJcbiAgICAgIGNvbnN0IHN0YXRlID0gY29udGV4dC5hcGkuZ2V0U3RhdGUoKTtcclxuICAgICAgY29uc3QgcHJvZmlsZUlkID0gc2VsZWN0b3JzLmFjdGl2ZVByb2ZpbGUoc3RhdGUpPy5pZDtcclxuICAgICAgaWYgKHByb2ZpbGVJZCA9PT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICAgIH1cclxuICAgICAgcmV0dXJuIChcclxuICAgICAgICA8SW5mb1BhbmVsV3JhcCBhcGk9e2NvbnRleHQuYXBpfSBwcm9maWxlSWQ9e3Byb2ZpbGVJZH0gLz5cclxuICAgICAgKTtcclxuICAgIH0pIGFzIGFueSxcclxuICB9KTtcclxuXHJcbiAgY29udGV4dC5yZWdpc3RlckFjdGlvbignZmItbG9hZC1vcmRlci1pY29ucycsIDE1MCwgJ2xvb3Qtc29ydCcsIHt9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgJ1ByZWZpeCBPZmZzZXQgQXNzaWduJywgKCkgPT4ge1xyXG4gICAgc2V0UHJlZml4T2Zmc2V0RGlhbG9nKGNvbnRleHQuYXBpKTtcclxuICB9LCAoKSA9PiB7XHJcbiAgICBjb25zdCBzdGF0ZSA9IGNvbnRleHQuYXBpLmdldFN0YXRlKCk7XHJcbiAgICBjb25zdCBhY3RpdmVHYW1lID0gc2VsZWN0b3JzLmFjdGl2ZUdhbWVJZChzdGF0ZSk7XHJcbiAgICByZXR1cm4gYWN0aXZlR2FtZSA9PT0gR0FNRV9JRDtcclxuICB9KTtcclxuXHJcbiAgY29udGV4dC5yZWdpc3RlckFjdGlvbignZmItbG9hZC1vcmRlci1pY29ucycsIDE1MCwgJ2xvb3Qtc29ydCcsIHt9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgJ1ByZWZpeCBPZmZzZXQgUmVzZXQnLCAoKSA9PiB7XHJcbiAgICByZXNldFByZWZpeE9mZnNldChjb250ZXh0LmFwaSk7XHJcbiAgfSwgKCkgPT4ge1xyXG4gICAgY29uc3Qgc3RhdGUgPSBjb250ZXh0LmFwaS5nZXRTdGF0ZSgpO1xyXG4gICAgY29uc3QgYWN0aXZlR2FtZSA9IHNlbGVjdG9ycy5hY3RpdmVHYW1lSWQoc3RhdGUpO1xyXG4gICAgcmV0dXJuIGFjdGl2ZUdhbWUgPT09IEdBTUVfSUQ7XHJcbiAgfSk7XHJcblxyXG4gIGNvbnN0IGdldE92ZXJoYXVsUGF0aCA9IChnYW1lOiB0eXBlcy5JR2FtZSkgPT4ge1xyXG4gICAgY29uc3Qgc3RhdGUgPSBjb250ZXh0LmFwaS5nZXRTdGF0ZSgpO1xyXG4gICAgY29uc3QgZGlzY292ZXJ5ID0gc2VsZWN0b3JzLmRpc2NvdmVyeUJ5R2FtZShzdGF0ZSwgR0FNRV9JRCk7XHJcbiAgICByZXR1cm4gZGlzY292ZXJ5Py5wYXRoO1xyXG4gIH07XHJcblxyXG4gIGNvbnRleHQucmVnaXN0ZXJJbnN0YWxsZXIoJzdkdGQtbW9kJywgMjUsXHJcbiAgICB0b0JsdWUodGVzdFN1cHBvcnRlZENvbnRlbnQpLCB0b0JsdWUoaW5zdGFsbENvbnRlbnQpKTtcclxuXHJcbiAgY29udGV4dC5yZWdpc3Rlckluc3RhbGxlcignN2R0ZC1yb290LW1vZCcsIDIwLCB0b0JsdWUodGVzdFJvb3RNb2QpLCB0b0JsdWUoaW5zdGFsbFJvb3RNb2QpKTtcclxuICBjb250ZXh0LnJlZ2lzdGVyTW9kVHlwZSgnN2R0ZC1yb290LW1vZCcsIDIwLCAoZ2FtZUlkKSA9PiBnYW1lSWQgPT09IEdBTUVfSUQsXHJcbiAgICBnZXRPdmVyaGF1bFBhdGgsIChpbnN0cnVjdGlvbnMpID0+IHtcclxuICAgICAgY29uc3QgY2FuZGlkYXRlRm91bmQgPSBoYXNDYW5kaWRhdGUoaW5zdHJ1Y3Rpb25zXHJcbiAgICAgICAgLmZpbHRlcihpbnN0ciA9PiAhIWluc3RyLmRlc3RpbmF0aW9uKVxyXG4gICAgICAgIC5tYXAoaW5zdHIgPT4gaW5zdHIuZGVzdGluYXRpb24pKTtcclxuICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZShjYW5kaWRhdGVGb3VuZCkgYXMgYW55O1xyXG4gICAgfSxcclxuICAgICAgeyBuYW1lOiAnUm9vdCBEaXJlY3RvcnkgTW9kJywgbWVyZ2VNb2RzOiB0cnVlLCBkZXBsb3ltZW50RXNzZW50aWFsOiBmYWxzZSB9KTtcclxuXHJcbiAgY29udGV4dC5yZWdpc3Rlck1pZ3JhdGlvbih0b0JsdWUob2xkID0+IG1pZ3JhdGUwMjAoY29udGV4dC5hcGksIG9sZCkpKTtcclxuICBjb250ZXh0LnJlZ2lzdGVyTWlncmF0aW9uKHRvQmx1ZShvbGQgPT4gbWlncmF0ZTEwMChjb250ZXh0LCBvbGQpKSk7XHJcbiAgY29udGV4dC5yZWdpc3Rlck1pZ3JhdGlvbih0b0JsdWUob2xkID0+IG1pZ3JhdGUxMDExKGNvbnRleHQsIG9sZCkpKTtcclxuXHJcbiAgcmV0dXJuIHRydWU7XHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0ge1xyXG4gIGRlZmF1bHQ6IG1haW4sXHJcbn07XHJcbiJdfQ==