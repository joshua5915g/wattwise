declare module 'react-plotly.js' {
    import { Component } from 'react';
    import * as Plotly from 'plotly.js';

    export interface PlotParams {
        data: Plotly.Data[];
        layout?: Partial<Plotly.Layout>;
        config?: Partial<Plotly.Config>;
        frames?: Plotly.Frame[];
        className?: string;
        style?: React.CSSProperties;
        onInitialized?: (figure: Readonly<Plotly.Figure>, graphDiv: Readonly<HTMLElement>) => void;
        onUpdate?: (figure: Readonly<Plotly.Figure>, graphDiv: Readonly<HTMLElement>) => void;
        onPurge?: (figure: Readonly<Plotly.Figure>, graphDiv: Readonly<HTMLElement>) => void;
        onError?: (err: Readonly<Error>) => void;
        onRedraw?: () => void;
        onRelayout?: (event: Readonly<Plotly.PlotRelayoutEvent>) => void;
        onRestyle?: (event: Readonly<Plotly.PlotRestyleEvent>) => void;
        useResizeHandler?: boolean;
        debug?: boolean;
        divId?: string;
        revision?: number;
    }

    export default class Plot extends Component<PlotParams> { }
}
