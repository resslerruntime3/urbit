/-  spider, graph-view, graph=graph-store, *metadata-store, *group
/+  strandio, resource
=>
|% 
++  strand  strand:spider
++  poke  poke:strandio
++  poke-our   poke-our:strandio
::
++  scry-metadata
  |=  [app=app-name:graph-view rid=resource]
  =/  m  (strand ,resource)
  ^-  form:m
  ;<  pax=(unit (set path))  bind:m
    %+  scry:strandio   ,(unit (set path))
    ;:  weld
      /gx/metadata-store/resource/[app]
      (en-path:resource rid)
      /noun
    ==
  ?>  ?=(^ pax)
  ?>  ?=(^ u.pax)
  (pure:m (de-path:resource n.u.pax))
::
++  scry-group
  |=  [app=app-name:graph-view rid=resource]
  =/  m  (strand ,group)
  ^-  form:m
  ;<  ugroup=(unit group)  bind:m
    %+  scry:strandio   ,(unit group)
    ;:  weld
      /gx/group-store/resource/[app]
      (en-path:resource rid)
      /noun
    ==
  (pure:m (need ugroup))
::
++  delete-graph
  |=  rid=resource
  =/  m  (strand ,~)
  ^-  form:m
  ;<  ~  bind:m
    (poke-our %graph-pull-hook %pull-hook-action !>([%remove rid]))
  ;<  ~  bind:m
    (poke-our %graph-store %graph-update !>([%archive-graph rid]))
  (pure:m ~)
--
::
^-  thread:spider
|=  arg=vase
=/  m  (strand ,vase)
^-  form:m
=+  !<([=action:graph-view ~] arg)
?>  ?=(%leave -.action)
;<  =bowl:spider  bind:m  get-bowl:strandio
?<  =(our.bowl entity.rid.action)
;<  group-rid=resource  bind:m  
  (scry-metadata app.action rid.action)
;<  g=group  bind:m
  (scry-group app.action group-rid)
?.  hidden.g
  ;<  ~  bind:m  (delete-graph rid.action)
  (pure:m !>(~))
;<  ~  bind:m
  (poke-our %group-push-hook %pull-hook-action !>([%remove rid.action]))
;<  ~  bind:m
  (poke-our %group-store %group-action !>([%remove-group rid.action]))
;<  ~  bind:m  (delete-graph rid.action)
(pure:m !>(~))
