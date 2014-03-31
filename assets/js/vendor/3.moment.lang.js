(function(){
    function onload (moment) {
   (function(){
moment.lang('en', {
    longDateFormat : {
    	LT : "h:mma",
        L : "MM/DD/YYYY",
        LL : "MM/DD",
        LLL : "MMMM D, LT",
        LLLL : "MMMM D YYYY, LT"
    }
});
})();
(function(){
// moment.js language configuration
// language : spanish (es)
// author : Julio Napurí : https://github.com/julionc

moment.lang('es', {
    months : "enero_febrero_marzo_abril_mayo_junio_julio_agosto_septiembre_octubre_noviembre_diciembre".split("_"),
    monthsShort : "ene._feb._mar._abr._may._jun._jul._ago._sep._oct._nov._dic.".split("_"),
    weekdays : "domingo_lunes_martes_miércoles_jueves_viernes_sábado".split("_"),
    weekdaysShort : "dom._lun._mar._mié._jue._vie._sáb.".split("_"),
    weekdaysMin : "Do_Lu_Ma_Mi_Ju_Vi_Sá".split("_"),
    longDateFormat : {
        LT : "HH:mm",
        L : "DD/MM",
        LL : "DD/MM/YYYY",
        LLL : "D \\de MMMM, LT",
        LLLL : "D \\de MMMM \\de YYYY, LT"
    },
    calendar : {
        sameDay : function () {
            return '[hoy a la' + ((this.hours() !== 1) ? 's' : '') + '] LT';
        },
        nextDay : function () {
            return '[mañana a la' + ((this.hours() !== 1) ? 's' : '') + '] LT';
        },
        nextWeek : function () {
            return 'dddd [a la' + ((this.hours() !== 1) ? 's' : '') + '] LT';
        },
        lastDay : function () {
            return '[ayer a la' + ((this.hours() !== 1) ? 's' : '') + '] LT';
        },
        lastWeek : function () {
            return '[el] dddd [pasado a la' + ((this.hours() !== 1) ? 's' : '') + '] LT';
        },
        sameElse : 'L'
    },
    relativeTime : {
        future : "en %s",
        past : "hace %s",
        s : "unos segundos",
        m : "un minuto",
        mm : "%d minutos",
        h : "una hora",
        hh : "%d horas",
        d : "un día",
        dd : "%d días",
        M : "un mes",
        MM : "%d meses",
        y : "un año",
        yy : "%d años"
    },
    ordinal : '%dº',
    week : {
        dow : 1, // Monday is the first day of the week.
        doy : 4  // The week that contains Jan 4th is the first week of the year.
    }
});
})();
(function(){
// moment.js language configuration
// language : french (fr)
// author : John Fischer : https://github.com/jfroffice

moment.lang('fr', {
    months : "janvier_février_mars_avril_mai_juin_juillet_août_septembre_octobre_novembre_décembre".split("_"),
    monthsShort : "janv._févr._mars_avr._mai_juin_juil._août_sept._oct._nov._déc.".split("_"),
    weekdays : "dimanche_lundi_mardi_mercredi_jeudi_vendredi_samedi".split("_"),
    weekdaysShort : "dim._lun._mar._mer._jeu._ven._sam.".split("_"),
    weekdaysMin : "Di_Lu_Ma_Me_Je_Ve_Sa".split("_"),
    longDateFormat : {
        LT : "HH:mm",
        L : "DD/MM/YYYY",
        LL : "D MMMM YYYY",
        LLL : "D MMMM YYYY LT",
        LLLL : "dddd D MMMM YYYY LT"
    },
    calendar : {
        sameDay: "[Aujourd'hui à] LT",
        nextDay: '[Demain à] LT',
        nextWeek: 'dddd [à] LT',
        lastDay: '[Hier à] LT',
        lastWeek: 'dddd [dernier à] LT',
        sameElse: 'L'
    },
    relativeTime : {
        future : "dans %s",
        past : "il y a %s",
        s : "quelques secondes",
        m : "une minute",
        mm : "%d minutes",
        h : "une heure",
        hh : "%d heures",
        d : "un jour",
        dd : "%d jours",
        M : "un mois",
        MM : "%d mois",
        y : "un an",
        yy : "%d ans"
    },
    ordinal : function (number) {
        return number + (number === 1 ? 'er' : 'ème');
    },
    week : {
        dow : 1, // Monday is the first day of the week.
        doy : 4  // The week that contains Jan 4th is the first week of the year.
    }
});
})();
(function(){
// moment.js language configuration
// language : italian (it)
// author : Lorenzo : https://github.com/aliem

moment.lang('it', {
    months : "Gennaio_Febbraio_Marzo_Aprile_Maggio_Giugno_Luglio_Agosto_Settembre_Ottobre_Novembre_Dicembre".split("_"),
    monthsShort : "Gen_Feb_Mar_Apr_Mag_Giu_Lug_Ago_Set_Ott_Nov_Dic".split("_"),
    weekdays : "Domenica_Lunedì_Martedì_Mercoledì_Giovedì_Venerdì_Sabato".split("_"),
    weekdaysShort : "Dom_Lun_Mar_Mer_Gio_Ven_Sab".split("_"),
    weekdaysMin : "D_L_Ma_Me_G_V_S".split("_"),
    longDateFormat : {
        LT : "HH:mm",
        L : "DD/MM/YYYY",
        LL : "D MMMM YYYY",
        LLL : "D MMMM YYYY LT",
        LLLL : "dddd, D MMMM YYYY LT"
    },
    calendar : {
        sameDay: '[Oggi alle] LT',
        nextDay: '[Domani alle] LT',
        nextWeek: 'dddd [alle] LT',
        lastDay: '[Ieri alle] LT',
        lastWeek: '[lo scorso] dddd [alle] LT',
        sameElse: 'L'
    },
    relativeTime : {
        future : "in %s",
        past : "%s fa",
        s : "secondi",
        m : "un minuto",
        mm : "%d minuti",
        h : "un'ora",
        hh : "%d ore",
        d : "un giorno",
        dd : "%d giorni",
        M : "un mese",
        MM : "%d mesi",
        y : "un anno",
        yy : "%d anni"
    },
    ordinal: '%dº',
    week : {
        dow : 1, // Monday is the first day of the week.
        doy : 4  // The week that contains Jan 4th is the first week of the year.
    }
});
})();
(function(){
// moment.js language configuration
// language : brazilian portuguese (pt-br)
// author : Caio Ribeiro Pereira : https://github.com/caio-ribeiro-pereira

moment.lang('pt-br', {
    months : "Janeiro_Fevereiro_Março_Abril_Maio_Junho_Julho_Agosto_Setembro_Outubro_Novembro_Dezembro".split("_"),
    monthsShort : "Jan_Fev_Mar_Abr_Mai_Jun_Jul_Ago_Set_Out_Nov_Dez".split("_"),
    weekdays : "Domingo_Segunda-feira_Terça-feira_Quarta-feira_Quinta-feira_Sexta-feira_Sábado".split("_"),
    weekdaysShort : "Dom_Seg_Ter_Qua_Qui_Sex_Sáb".split("_"),
    weekdaysMin : "Dom_2ª_3ª_4ª_5ª_6ª_Sáb".split("_"),
    longDateFormat : {
        LT : "HH:mm",
        L : "DD/MM/YYYY",
        LL : "D \\de MMMM \\de YYYY",
        LLL : "D \\de MMMM \\de YYYY LT",
        LLLL : "dddd, D \\de MMMM \\de YYYY LT"
    },
    calendar : {
        sameDay: '[Hoje às] LT',
        nextDay: '[Amanhã às] LT',
        nextWeek: 'dddd [às] LT',
        lastDay: '[Ontem às] LT',
        lastWeek: function () {
            return (this.day() === 0 || this.day() === 6) ?
                '[Último] dddd [às] LT' : // Saturday + Sunday
                '[Última] dddd [às] LT'; // Monday - Friday
        },
        sameElse: 'L'
    },
    relativeTime : {
        future : "em %s",
        past : "%s atrás",
        s : "segundos",
        m : "um minuto",
        mm : "%d minutos",
        h : "uma hora",
        hh : "%d horas",
        d : "um dia",
        dd : "%d dias",
        M : "um mês",
        MM : "%d meses",
        y : "um ano",
        yy : "%d anos"
    },
    ordinal : '%dº'
});
})();
(function(){
// moment.js language configuration
// language : portuguese (pt)
// author : Jefferson : https://github.com/jalex79

moment.lang('pt', {
    months : "Janeiro_Fevereiro_Março_Abril_Maio_Junho_Julho_Agosto_Setembro_Outubro_Novembro_Dezembro".split("_"),
    monthsShort : "Jan_Fev_Mar_Abr_Mai_Jun_Jul_Ago_Set_Out_Nov_Dez".split("_"),
    weekdays : "Domingo_Segunda-feira_Terça-feira_Quarta-feira_Quinta-feira_Sexta-feira_Sábado".split("_"),
    weekdaysShort : "Dom_Seg_Ter_Qua_Qui_Sex_Sáb".split("_"),
    weekdaysMin : "Dom_2ª_3ª_4ª_5ª_6ª_Sáb".split("_"),
    longDateFormat : {
        LT : "HH:mm",
        L : "DD/MM/YYYY",
        LL : "D \\de MMMM \\de YYYY",
        LLL : "D \\de MMMM \\de YYYY LT",
        LLLL : "dddd, D \\de MMMM \\de YYYY LT"
    },
    calendar : {
        sameDay: '[Hoje às] LT',
        nextDay: '[Amanhã às] LT',
        nextWeek: 'dddd [às] LT',
        lastDay: '[Ontem às] LT',
        lastWeek: function () {
            return (this.day() === 0 || this.day() === 6) ?
                '[Último] dddd [às] LT' : // Saturday + Sunday
                '[Última] dddd [às] LT'; // Monday - Friday
        },
        sameElse: 'L'
    },
    relativeTime : {
        future : "em %s",
        past : "%s atrás",
        s : "segundos",
        m : "um minuto",
        mm : "%d minutos",
        h : "uma hora",
        hh : "%d horas",
        d : "um dia",
        dd : "%d dias",
        M : "um mês",
        MM : "%d meses",
        y : "um ano",
        yy : "%d anos"
    },
    ordinal : '%dº',
    week : {
        dow : 1, // Monday is the first day of the week.
        doy : 4  // The week that contains Jan 4th is the first week of the year.
    }
});
})();
	moment.lang('en')
    }
    if (typeof define === "function" && define.amd) {
        define(["moment"], onload);
    }
    if (typeof window !== "undefined" && window.moment) {
        onload(window.moment);
    }
})();
