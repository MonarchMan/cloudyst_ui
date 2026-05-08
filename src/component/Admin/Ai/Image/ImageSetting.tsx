import { Delete } from "@mui/icons-material";
import {
  Badge,
  Box,
  Button,
  Checkbox,
  Container,
  Divider,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { bindPopover, bindTrigger, usePopupState } from "material-ui-popup-state/hooks";
import { useQueryState } from "nuqs";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { batchDeleteImages, getImageList } from "../../../../api/api";
import { AiImage } from "../../../../api/dashboard";
import { useAppDispatch } from "../../../../redux/hooks";
import { confirmOperation } from "../../../../redux/thunks/dialog";
import { NoWrapTableCell, SecondaryButton, StyledTableContainerPaper } from "../../../Common/StyledComponents";
import ArrowSync from "../../../Icons/ArrowSync";
import Filter from "../../../Icons/Filter";
import PageContainer from "../../../Pages/PageContainer";
import PageHeader from "../../../Pages/PageHeader";
import TablePagination from "../../Common/TablePagination";
import { OrderByQuery, OrderDirectionQuery, PageQuery, PageSizeQuery } from "../../StoragePolicy/StoragePolicySetting";
import ImageFilterPopover from "./ImageFilterPopover";
import ImageRow from "./ImageRow";
import ImageDialog from "./ImageDialog/ImageDialog";
import UserDialog from "../../User/UserDialog/UserDialog";

export const PlatformQuery = "platform";
export const ModelIdQuery = "model_id";
export const UserIdQuery = "user_id";

const ImageSetting = () => {
  const { t } = useTranslation("dashboard");
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(true);
  const [images, setImages] = useState<AiImage[]>([]);
  const [page, setPage] = useQueryState(PageQuery, { defaultValue: "1" });
  const [pageSize, setPageSize] = useQueryState(PageSizeQuery, {
    defaultValue: "10",
  });
  const [orderBy, setOrderBy] = useQueryState(OrderByQuery, {
    defaultValue: "",
  });
  const [orderDirection, setOrderDirection] = useQueryState(OrderDirectionQuery, { defaultValue: "desc" });
  const [platform, setPlatform] = useQueryState(PlatformQuery, { defaultValue: "" });
  const [modelId, setModelId] = useQueryState(ModelIdQuery, { defaultValue: "" });
  const [userId, setUserId] = useQueryState(UserIdQuery, { defaultValue: "" });
  const [count, setCount] = useState(0);
  const [selected, setSelected] = useState<readonly number[]>([]);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const filterPopupState = usePopupState({
    variant: "popover",
    popupId: "imageFilterPopover",
  });

  const [userDialogOpen, setUserDialogOpen] = useState(false);
  const [userDialogID, setUserDialogID] = useState<number | undefined>(undefined);
  const [imageDialogOpen, setImageDialogOpen] = useState(false);
  const [imageDialogID, setImageDialogID] = useState<number | undefined>(undefined);

  const pageInt = parseInt(page) ?? 1;
  const pageSizeInt = parseInt(pageSize) ?? 10;

  const clearFilters = useCallback(() => {
    setPlatform("");
    setModelId("");
    setUserId("");
  }, [setPlatform, setModelId, setUserId]);

  useEffect(() => {
    fetchImages();
  }, [page, pageSize, orderBy, orderDirection, platform, modelId, userId]);

  const fetchImages = () => {
    setLoading(true);
    setSelected([]);
    dispatch(
      getImageList({
        page: pageInt,
        page_size: pageSizeInt,
        order_by: orderBy ?? "",
        order_direction: orderDirection ?? "desc",
        conditions: {
          platform: platform,
          model_id: modelId,
          user_id: userId,
        },
      }),
    )
      .then((res) => {
        setImages(res.images);
        setPageSize(res.pagination.page_size.toString());
        setCount(res.pagination.total_items ?? 0);
        setLoading(false);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleDelete = () => {
    setDeleteLoading(true);
    dispatch(confirmOperation(t("image.confirmBatchDelete", { num: selected.length })))
      .then(() => {
        dispatch(batchDeleteImages({ ids: Array.from(selected) }))
          .then(() => {
            fetchImages();
          })
          .finally(() => {
            setDeleteLoading(false);
          });
      })
      .finally(() => {
        setDeleteLoading(false);
      });
  };

  const handleSelectAllClick = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      const newSelected = images.map((n) => n.image.id);
      setSelected(newSelected);
      return;
    }
    setSelected([]);
  };

  const handleSelect = useCallback(
    (id: number) => {
      const selectedIndex = selected.indexOf(id);
      let newSelected: readonly number[] = [];

      if (selectedIndex === -1) {
        newSelected = newSelected.concat(selected, id);
      } else if (selectedIndex === 0) {
        newSelected = newSelected.concat(selected.slice(1));
      } else if (selectedIndex === selected.length - 1) {
        newSelected = newSelected.concat(selected.slice(0, -1));
      } else if (selectedIndex > 0) {
        newSelected = newSelected.concat(selected.slice(0, selectedIndex), selected.slice(selectedIndex + 1));
      }
      setSelected(newSelected);
    },
    [selected],
  );

  const orderById = orderBy === "id" || orderBy === "";
  const direction = orderDirection as "asc" | "desc";
  const onSortClick = (field: string) => () => {
    const alreadySorted = orderBy === field || (field === "id" && orderById);
    setOrderBy(field);
    setOrderDirection(alreadySorted ? (direction === "asc" ? "desc" : "asc") : "asc");
  };

  const hasActiveFilters = useMemo(() => {
    return !!(platform || modelId || userId);
  }, [platform, modelId, userId]);

  const handleUserDialogOpen = (id: number) => {
    setUserDialogID(id);
    setUserDialogOpen(true);
  };

  const handleImageDialogOpen = (id: number) => {
    setImageDialogID(id);
    setImageDialogOpen(true);
  };

  return (
    <PageContainer>
      <UserDialog open={userDialogOpen} onClose={() => setUserDialogOpen(false)} userID={userDialogID} />
      <ImageDialog open={imageDialogOpen} onClose={() => setImageDialogOpen(false)} imageID={imageDialogID} />
      <Container maxWidth="xl">
        <PageHeader title={t("dashboard:nav.images")} />
        <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
          <SecondaryButton onClick={fetchImages} disabled={loading} variant={"contained"} startIcon={<ArrowSync />}>
            {t("node.refresh")}
          </SecondaryButton>

          <Badge color="primary" variant="dot" invisible={!hasActiveFilters}>
            <SecondaryButton startIcon={<Filter />} variant="contained" {...bindTrigger(filterPopupState)}>
              {t("user.filter")}
            </SecondaryButton>
          </Badge>

          <ImageFilterPopover
            {...bindPopover(filterPopupState)}
            platform={platform}
            setPlatform={setPlatform}
            modelId={modelId}
            setModelId={setModelId}
            userId={userId}
            setUserId={setUserId}
            clearFilters={clearFilters}
          />

          {selected.length > 0 && !isMobile && (
            <>
              <Divider orientation="vertical" flexItem />
              <Button startIcon={<Delete />} variant="contained" color="error" onClick={handleDelete}>
                {t("image.deleteXImages", { num: selected.length })}
              </Button>
            </>
          )}
        </Stack>
        {isMobile && selected.length > 0 && (
          <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
            <Button startIcon={<Delete />} variant="contained" color="error" onClick={handleDelete}>
              {t("image.deleteXImages", { num: selected.length })}
            </Button>
          </Stack>
        )}
        <TableContainer component={StyledTableContainerPaper} sx={{ mt: 2 }}>
          <Table size="small" stickyHeader sx={{ width: "100%", tableLayout: "fixed" }}>
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox" sx={{ width: "36px!important" }} width={50}>
                  <Checkbox
                    size="small"
                    disableRipple
                    color="primary"
                    indeterminate={selected.length > 0 && selected.length < images.length}
                    checked={images.length > 0 && selected.length === images.length}
                    onChange={handleSelectAllClick}
                  />
                </TableCell>
                <NoWrapTableCell width={60} sortDirection={orderById ? direction : false}>
                  <TableSortLabel active={orderById} direction={direction} onClick={onSortClick("id")}>
                    {t("group.#")}
                  </TableSortLabel>
                </NoWrapTableCell>
                <NoWrapTableCell width={80}>{t("image.userId")}</NoWrapTableCell>
                <NoWrapTableCell width={100}>{t("image.platform")}</NoWrapTableCell>
                <NoWrapTableCell width={150}>{t("image.model")}</NoWrapTableCell>
                <NoWrapTableCell width={200}>{t("image.prompt")}</NoWrapTableCell>
                <NoWrapTableCell width={80}>{t("image.dimensions")}</NoWrapTableCell>
                <NoWrapTableCell width={80}>{t("common.status")}</NoWrapTableCell>
                <NoWrapTableCell width={100} align="right"></NoWrapTableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {!loading &&
                images.map((image) => (
                  <ImageRow
                    deleting={deleteLoading}
                    key={image.image.id}
                    image={image}
                    onDelete={fetchImages}
                    selected={selected.includes(image.image.id)}
                    onSelect={handleSelect}
                    onDetails={handleImageDialogOpen}
                    openUserDialog={handleUserDialogOpen}
                  />
                ))}
              {loading &&
                images.length > 0 &&
                images.slice(0, 10).map((image) => <ImageRow key={`loading-${image.image.id}`} loading={true} />)}
              {loading &&
                images.length === 0 &&
                Array.from(Array(10)).map((_, index) => <ImageRow key={`loading-${index}`} loading={true} />)}
            </TableBody>
          </Table>
        </TableContainer>
        {count > 0 && (
          <Box sx={{ mt: 1 }}>
            <TablePagination
              page={pageInt}
              totalItems={count}
              rowsPerPage={pageSizeInt}
              rowsPerPageOptions={[10, 25, 50, 100, 200, 500]}
              onRowsPerPageChange={(value) => setPageSize(value.toString())}
              onChange={(_, value) => setPage(value.toString())}
            />
          </Box>
        )}
      </Container>
    </PageContainer>
  );
};

export default ImageSetting;
