import { Entanglement, qt } from "stencil-quantum";
import { TApiClient } from "../libs/api";
import { TAppInfoApi } from "../services/app-config.service";
import { TMatchConfig } from "../services/gameserver.service";

/**
 * Entanglements used to provide data across DOM
 */
export const app = new Entanglement({
  /**
   * Current API client
   */
  api: qt<TApiClient>(),

  /**
   * Current appConfig
   */
  appConfig: qt<TAppInfoApi>({ mutable: true }),

  /**
   * User logged in as admin
   */
  isAdmin: qt<boolean>({ default: false }),

  /**
   * Match Configs
   */
  matchConfigs: qt<TMatchConfig[]>({ mutable: true }),
});
