import { DateUtils } from 'typeorm/util/DateUtils'
import moment from "moment"
import pg from "pg"

/**
 * Force storing a UTC date with no conversion at any time
 */
export const monkeypatch = () => {

    DateUtils.mixedDateToDate = (mixedDate: Date|string, toUtc: boolean = true, useMilliseconds = true) => {
        let date = typeof mixedDate === "string" ? new Date(mixedDate) : mixedDate;
   
           if (toUtc)
               date = new Date(
                   date.getUTCFullYear(),
                   date.getUTCMonth(),
                   date.getUTCDate(),
                   date.getUTCHours(),
                   date.getUTCMinutes(),
                   date.getUTCSeconds(),
                   date.getUTCMilliseconds()
               );
   
           if (!useMilliseconds)
               date.setUTCMilliseconds(0);
   
           return date;
       };

    pg.types.setTypeParser(1114, str => moment.utc(str).toDate());
  
}
