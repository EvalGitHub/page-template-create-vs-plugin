declare module 'download-git-repo' {
  function download(
    repo: string,
    dest: string,
    opts: { clone?: boolean },
    callback: (err?: Error) => void
  ): void;

  export = download;
}