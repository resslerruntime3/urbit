import React, { Component } from 'react';
import { OverlaySigil } from './overlay-sigil';
import { uxToHex, cite, writeText } from '../../../../lib/util';
import moment from 'moment';
import ReactMarkdown from 'react-markdown';
import RemarkDisableTokenizers from 'remark-disable-tokenizers';

const DISABLED_BLOCK_TOKENS = [
  'indentedCode',
  'blockquote',
  'atxHeading',
  'thematicBreak',
  'list',
  'setextHeading',
  'html',
  'definition',
  'table'
];

const DISABLED_INLINE_TOKENS = [
  'autoLink',
  'url',
  'email',
  'link',
  'reference'
];

const MessageMarkdown = React.memo(
  props => (<ReactMarkdown
              {...props}
              plugins={[[RemarkDisableTokenizers, { block: DISABLED_BLOCK_TOKENS, inline: DISABLED_INLINE_TOKENS }]]}
            />));

export class Message extends Component {
  constructor() {
    super();
    this.state = {
      unfold: false,
      copied: false
    };
    this.unFoldEmbed = this.unFoldEmbed.bind(this);
  }

  unFoldEmbed(id) {
    let unfoldState = this.state.unfold;
    unfoldState = !unfoldState;
    this.setState({ unfold: unfoldState });
    const iframe = this.refs.iframe;
    iframe.setAttribute('src', iframe.getAttribute('data-src'));
  }

  renderContent() {
    const { props } = this;
    const content = props.msg.contents[0];
    const font = !!props.isParent ? "f6" : "f7";

    if ('code' in content) {
      const outputElement =
        (Boolean(content.code.output) &&
         content.code.output.length && content.code.output.length > 0) ?
        (
          <pre className={`${font} clamp-attachment pa1 mt0 mb0 b--gray4 b--gray1-d bl br bb`}>
            {content.code.output[0].join('\n')}
          </pre>
        ) : null;
      return (
        <div className="mv2">
          <pre className={`${font} clamp-attachment pa1 mt0 mb0 bg-light-gray b--gray4 b--gray1-d ba`}>
            {content.code.expression}
          </pre>
          {outputElement}
        </div>
      );
    } else if ('url' in content) {
      let imgMatch =
        /(jpg|img|png|gif|tiff|jpeg|JPG|IMG|PNG|TIFF|GIF|webp|WEBP|webm|WEBM|svg|SVG)$/
        .exec(content.url);
      const youTubeRegex = new RegExp(String(/(?:https?:\/\/(?:[a-z]+.)?)/.source) // protocol
      + /(?:youtu\.?be(?:\.com)?\/)(?:embed\/)?/.source // short and long-links
      + /(?:(?:(?:(?:watch\?)?(?:time_continue=(?:[0-9]+))?.+v=)?([a-zA-Z0-9_-]+))(?:\?t\=(?:[0-9a-zA-Z]+))?)/.source // id
      );
      const ytMatch =
      youTubeRegex.exec(content.url);
      let contents = content.url;
      if (imgMatch) {
        contents = (
          <img
            className="o-80-d"
            src={content.url}
            style={{
              width: '50%',
              maxWidth: '250px'
            }}
          ></img>
        );
        return (
          <a className={`${font} lh-copy v-top word-break-all`}
            href={content.url}
            target="_blank"
            rel="noopener noreferrer"
          >
            {contents}
          </a>
        );
      } else if (ytMatch) {
        contents = (
          <div className={'embed-container mb2 w-100 w-75-l w-50-xl ' +
          ((this.state.unfold === true)
            ? 'db' : 'dn')}
          >
          <iframe
            ref="iframe"
            width="560"
            height="315"
            data-src={`https://www.youtube.com/embed/${ytMatch[1]}`}
            frameBorder="0" allow="picture-in-picture, fullscreen"
          >
          </iframe>
          </div>
        );
        return (
          <div>
          <a href={content.url}
          className={`${font} lh-copy v-top bb b--white-d word-break-all`}
          href={content.url}
          target="_blank"
          rel="noopener noreferrer"
          >
            {content.url}
        </a>
        <a className="ml2 f7 pointer lh-copy v-top"
        onClick={e => this.unFoldEmbed()}
        >
          [embed]
          </a>
        {contents}
        </div>
        );
      } else {
        return (
          <a className={`${font} lh-copy v-top bb b--white-d b--black word-break-all`}
            href={content.url}
            target="_blank"
            rel="noopener noreferrer"
          >
            {contents}
          </a>
        );
      }
    } else {
        return (
          <section>
            <MessageMarkdown
              source={content.text}
            />
          </section>
        );
    }
  }

  render() {
    const { props, state } = this;
    const datestamp = '~' + moment.unix(props.msg['time-sent'] / 1000).format('YYYY.M.D');

    const paddingTop = { 'paddingTop': '6px' };

    const timestamp = moment.unix(props.msg['time-sent'] / 1000).format('hh:mm a');

    let name = `~${props.msg.author}`;
    let color = '#000000';
    let sigilClass = 'mix-blend-diff';

    const bodyFont = !!props.isParent ? "f6" : "f8";
    const smallFont = !!props.isParent ? "f7" : "f9";

    return (
      <div
        ref={this.containerRef}
        className={
          `w-100 ${bodyFont} pl3 pt4 pr3 cf flex lh-copy bt b--white pointer`
        }
        style={{
          minHeight: 'min-content'
        }}
        onClick={() => {
          props.history.push(`/~post/room/` +
            `${props.resource.ship}/${props.resource.name}${props.index}`);
        }} 
      >
       <OverlaySigil
         ship={props.msg.author}
         color={'#000'}
         sigilClass={sigilClass}
         group={props.group}
         className="fl pr3 v-top bg-white bg-gray0-d"
       />
        <div
          className="fr clamp-message white-d"
          style={{ flexGrow: 1, marginTop: -8 }}
        >
          <div className="hide-child" style={paddingTop}>
            <p className={`v-mid ${smallFont} gray2 dib mr3 c-default`}>
              <span>{`~${props.msg.author}`}</span>
            </p>
            <p className={`v-mid mono ${smallFont} gray2 dib`}>{timestamp}</p>
            <p className={`v-mid mono ${smallFont} ml2 gray2 dib child dn-s`}>
              {datestamp}
            </p>
          </div>
          {this.renderContent()}
        </div>
      </div>
    );
  }
}
