
How To Generate stm_routes.geojson

`wget https://www.stm.info/sites/default/files/gtfs/stm_sig.zip`
`unzip stm_sig.zip`
`ogr2ogr -t_srs EPSG:4326 stm_routes.geojson stm_lignes_sig.shp`

Move that file into /docs
