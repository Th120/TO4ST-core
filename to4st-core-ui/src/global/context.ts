
import { Entanglement, qt } from "stencil-quantum";
import { AppConfig } from "../libs/api-client/schema";
import { APIClient } from "../libs/api";

/**
 * Entanglements used to provide data across DOM
 */
export const app = new Entanglement({
    /**
     * Current API client
     */
    api: qt<APIClient>(),

    /**
     * Current appConfig
     */
    appConfig: qt<AppConfig>({mutable: true}),

    /**
     * User logged in as admin
     */
    isAdmin: qt<boolean>({default: false}),
});
