export interface CommitlogFilterOption {
  pickType:string;
  omitType:string;
  pickScope:string;
  omitScope:string;
  pickSubject:string;
  omitSubject:string;
  pickFile:string;
  omitFile:string;
  filterOrder:string;
  lastestCount:number;
  sinceLastHash:boolean;
}